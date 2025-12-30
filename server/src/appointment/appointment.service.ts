import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Role, Status } from '@prisma/client';
import { start } from 'repl';

@Injectable()
export class AppointmentService {
  constructor(private prismaService: PrismaService) {}

  async createAppointment(
    dto: CreateAppointmentDto,
    user: { id: number; role: Role , name : string},
  ) {
    if (user.role !== Role.CLIENT) {
      throw new ForbiddenException('Only clients can create appointments');
    }

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (startAt >= endAt) {
      throw new ForbiddenException('Invalid appointment time range');
    }

    const day = startAt.getDay();
    if (day === 0) {
      throw new ForbiddenException(
        'Appointments cannot be scheduled on Sundays',
      );
    }

    const startHour = startAt.getHours();
    const endHour = endAt.getHours();

    if (startHour < 10 || endHour > 19) {
      throw new ForbiddenException(
        'Appointments must be between 10 AM and 7 PM',
      );
    }
    if (startAt.getMinutes() !== 0 || endAt.getMinutes() !== 0) {
      throw new ForbiddenException(
        'Appointments must start and end on full hours',
      );
    }

    const conflict = await this.prismaService.appointment.findFirst({
      where: {
        consultantId: dto.consultantId,
        status: {
          in: [Status.PENDING, Status.SCHEDULED],
        },
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    });
    if (conflict) {
      throw new ForbiddenException(
        'The consultant is not available during the selected time slot',
      );
    }

    const appointment = await this.prismaService.appointment.create({
      data: {
        consultantId: dto.consultantId,
        clientId: user.id,
        startAt,
        endAt,
        purpose: dto.purpose,
        status: Status.PENDING,
      },
    });

    return appointment;
  }

  //get looged in user's appointments
  async myAppointments(user: { id: number; role: Role }) {
    if (user.role !== Role.CLIENT) {
      throw new ForbiddenException('Only clients can view their appointments');
    }

    const appointments = await this.prismaService.appointment.findMany({
      where: {
        clientId: user.id,
      },
      orderBy: {
        startAt: 'asc',
      },
    });
    return appointments;
  }

  async consultantAppointments(user: { id: number; role: Role }) {
    if (user.role !== Role.CONSULTANT) {
      throw new ForbiddenException(
        'Only consultants can view their appointments',
      );
    }
    const appointments = await this.prismaService.appointment.findMany({
      where: {
        consultantId: user.id,
        status: { in: [Status.SCHEDULED, Status.PENDING] },
      },
      orderBy: {
        startAt: 'asc',
      },
    });
    return appointments;
  }

  async acceptAppointment(
    appointmentId: number,
    user: { id: number; role: Role },
  ) {
    if (user.role !== Role.CONSULTANT) {
      throw new ForbiddenException('Only consultants can accept appointments');
    }

    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.consultantId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to accept this appointment',
      );
    }
    if (appointment.status !== Status.PENDING) {
      throw new ForbiddenException('Only pending appointments can be accepted');
    }
    const updateAppointment = await this.prismaService.appointment.update({
      where: { id: appointmentId },
      data: { status: Status.SCHEDULED },
    });
    return updateAppointment;
  }

  //reject appointment
  async rejectAppointment(
    appointmentId: number,
    user: { id: number; role: Role },
  ) {
    if (user.role !== Role.CONSULTANT) {
      throw new ForbiddenException('Only consultants can reject appointments');
    }

    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.consultantId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to reject this appointment',
      );
    }
    if (appointment.status !== Status.PENDING) {
      throw new ForbiddenException('Only pending appointments can be rejected');
    }
    const updateAppointment = await this.prismaService.appointment.update({
      where: { id: appointmentId },
      data: { status: Status.REJECTED },
    });
    return updateAppointment;
  }

  //cancel appointment
  async cancelAppointment(
    appointmentId: number,
    user: { id: number; role: Role },
  ) {
    if (user.role !== Role.CLIENT) {
      throw new ForbiddenException('Only clients can cancel appointments');
    }
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.clientId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to cancel this appointment',
      );
    }
    if (
      appointment.status !== Status.SCHEDULED &&
      appointment.status !== Status.PENDING
    ) {
      throw new ForbiddenException(
        'Only scheduled and pending appointments can be canceled',
      );
    }
    const updateAppointment = await this.prismaService.appointment.update({
      where: { id: appointmentId },
      data: { status: Status.CANCELED },
    });
    return updateAppointment;
  }

  //complete appointment
  async completeAppointment(
    appointmentId: number,
    user: { id: number; role: Role },
  ) {
    if (user.role !== Role.CONSULTANT) {
      throw new ForbiddenException(
        'Only consultants can complete appointments',
      );
    }
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.consultantId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to complete this appointment',
      );
    }
    if (appointment.status !== Status.SCHEDULED) {
      throw new ForbiddenException(
        'Only scheduled appointments can be completed',
      );
    }
    const updateAppointment = await this.prismaService.appointment.update({
      where: { id: appointmentId },
      data: { status: Status.COMPLETED },
    });
    return updateAppointment;
  }

  //get Avalibility of a consultant
  async getAvalibility(consultantId: number, date: string) {
    const day = new Date(date);

    // No appointments on Sunday
    if (day.getDay() === 0) {
      return [];
    }

    // Slots from 10 AM to 7 PM
    const slots: Array<{ start: Date; end: Date }> = [];

    for (let hr = 10; hr < 19; hr++) {
      const start = new Date(date);
      start.setHours(hr, 0, 0, 0);

      const end = new Date(date);
      end.setHours(hr + 1, 0, 0, 0);

      slots.push({ start, end });
    }

    //  Fetch booked appointments
    const bookedAppointments = await this.prismaService.appointment.findMany({
      where: {
        consultantId,
        status: {
          in: [Status.PENDING, Status.SCHEDULED],
        },
        startAt: {
          gte: slots[0].start,
          lte: slots[slots.length - 1].end,
        },
      },
    });

    //  Filter available slots (FIXED RETURN)
    const availableSlots = slots.filter(
      (slot) =>
        !bookedAppointments.some(
          (b) => b.startAt < slot.end && b.endAt > slot.start,
        ),
    );

    //  Frontend-friendly response
    return availableSlots.map((slot) => ({
      start: slot.start,
      end: slot.end,
    }));
  }
}
