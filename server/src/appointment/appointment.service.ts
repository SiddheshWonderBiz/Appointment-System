import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Role, Status } from '@prisma/client';

import { MailService } from 'src/mail/mail.service';
import {
  appointmentCreatedHtml,
  appointmentStatusHtml,
} from 'src/mail/mail.html-templates';
// import { getISTNow } from 'src/utils/time.util';
import { istToUtc } from 'src/utils/time.util';

@Injectable()
export class AppointmentService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  /* ------------------ HELPERS ------------------ */

  private formatDateTime(date: Date) {
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  }

  /* ------------------ CREATE ------------------ */

  async createAppointment(
    dto: CreateAppointmentDto,
    user: { id: number; role: Role },
  ) {
    if (user.role !== Role.CLIENT) {
      throw new ForbiddenException('Only clients can create appointments');
    }

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    const now = new Date();

    // Basic checks
    if (startAt >= endAt) {
      throw new ForbiddenException('Invalid time range');
    }

    // Sunday block
    if (startAt.getDay() === 0) {
      throw new ForbiddenException('Appointments not allowed on Sundays');
    }

    // Past date / time block
    if (startAt <= now) {
      throw new ForbiddenException('Cannot book past time slots');
    }

    // Working hours: 10 AM – 7 PM (1-hour only)
    if (
      startAt.getHours() < 10 ||
      endAt.getHours() > 19 ||
      startAt.getMinutes() !== 0 ||
      endAt.getMinutes() !== 0 ||
      endAt.getTime() - startAt.getTime() !== 60 * 60 * 1000
    ) {
      throw new ForbiddenException(
        'Appointments must be between 10 AM and 7 PM (1 hour only)',
      );
    }

    // Conflict check
    const conflict = await this.prismaService.appointment.findFirst({
      where: {
        consultantId: dto.consultantId,
        status: { in: [Status.PENDING, Status.SCHEDULED] },
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    });

    if (conflict) {
      throw new ForbiddenException('Slot already booked');
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
      include: { consultant: true, client: true },
    });

    const { date, time } = this.formatDateTime(startAt);

    const mail = appointmentCreatedHtml(appointment.client.name, date, time);

    await this.mailService.sendMail({
      to: appointment.consultant.email,
      subject: mail.subject,
      html: mail.html,
    });

    return appointment;
  }

  /* ------------------ CLIENT ------------------ */

  async myAppointments(user: { id: number; role: Role }) {
    if (user.role !== Role.CLIENT) {
      throw new ForbiddenException('Only clients can view appointments');
    }

    return this.prismaService.appointment.findMany({
      where: {
        clientId: user.id,
        status: { in: [Status.PENDING, Status.SCHEDULED] },
      },
      orderBy: { startAt: 'asc' },
      include: {
        consultant: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async myPrevAppointments(user: { id: number; role: Role }) {
    if (user.role !== Role.CLIENT) {
      throw new ForbiddenException('Only clients can view appointments');
    }

    return this.prismaService.appointment.findMany({
      where: {
        clientId: user.id,
        status: { in: [Status.COMPLETED, Status.CANCELLED, Status.REJECTED] },
      },
      orderBy: { startAt: 'asc' },
      include: {
        consultant: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /* ------------------ CONSULTANT ------------------ */

  async consultantAppointments(user: { id: number; role: Role }) {
    if (user.role !== Role.CONSULTANT) {
      throw new ForbiddenException('Only consultants can view appointments');
    }

    return this.prismaService.appointment.findMany({
      where: {
        consultantId: user.id,
        status: { in: [Status.PENDING, Status.SCHEDULED] },
      },
      orderBy: { startAt: 'asc' },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async consultantPrevAppointments(user: { id: number; role: Role }) {
    if (user.role !== Role.CONSULTANT) {
      throw new ForbiddenException('Only consultants can view appointments');
    }

    return this.prismaService.appointment.findMany({
      where: {
        consultantId: user.id,
        status: { in: [Status.CANCELLED, Status.COMPLETED, Status.REJECTED] },
      },
      orderBy: { startAt: 'asc' },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /* ------------------ STATUS ACTIONS ------------------ */

  async acceptAppointment(id: number, user: { id: number; role: Role }) {
    if (user.role !== Role.CONSULTANT) {
      throw new ForbiddenException();
    }

    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
      include: { client: true, consultant: true },
    });

    if (!appointment || appointment.consultantId !== user.id) {
      throw new ForbiddenException();
    }

    if (appointment.status !== Status.PENDING) {
      throw new ForbiddenException('Only pending appointments allowed');
    }

    const updated = await this.prismaService.appointment.update({
      where: { id },
      data: { status: Status.SCHEDULED },
    });

    const { date, time } = this.formatDateTime(appointment.startAt);

    const mail = appointmentStatusHtml(
      'ACCEPTED',
      appointment.consultant.name,
      date,
      time,
    );

    await this.mailService.sendMail({
      to: appointment.client.email,
      subject: mail.subject,
      html: mail.html,
    });

    return updated;
  }

  async rejectAppointment(id: number, user: { id: number; role: Role }) {
    if (user.role !== Role.CONSULTANT) throw new ForbiddenException();

    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
      include: { client: true, consultant: true },
    });

    if (!appointment || appointment.consultantId !== user.id) {
      throw new ForbiddenException();
    }

    if (appointment.status !== Status.PENDING) {
      throw new ForbiddenException();
    }

    const updated = await this.prismaService.appointment.update({
      where: { id },
      data: { status: Status.REJECTED },
    });

    const { date, time } = this.formatDateTime(appointment.startAt);

    const mail = appointmentStatusHtml(
      'REJECTED',
      appointment.consultant.name,
      date,
      time,
    );

    await this.mailService.sendMail({
      to: appointment.client.email,
      subject: mail.subject,
      html: mail.html,
    });

    return updated;
  }

  async cancelAppointment(id: number, user: { id: number; role: Role }) {
    if (user.role !== Role.CLIENT) throw new ForbiddenException();

    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
      include: { client: true, consultant: true },
    });

    if (!appointment || appointment.clientId !== user.id) {
      throw new ForbiddenException();
    }

    if (
      appointment.status !== Status.PENDING &&
      appointment.status !== Status.SCHEDULED
    ) {
      throw new ForbiddenException('Cannot cancel this appointment');
    }

    const updated = await this.prismaService.appointment.update({
      where: { id },
      data: { status: Status.CANCELLED },
    });

    const { date, time } = this.formatDateTime(appointment.startAt);

    const mail = appointmentStatusHtml(
      'CANCELLED',
      appointment.consultant.name,
      date,
      time,
    );

    await this.mailService.sendMail({
      to: appointment.client.email,
      subject: mail.subject,
      html: mail.html,
    });

    return updated;
  }

  async completeAppointment(id: number, user: { id: number; role: Role }) {
    if (user.role !== Role.CONSULTANT) throw new ForbiddenException();

    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
      include: { client: true, consultant: true },
    });

    if (!appointment || appointment.consultantId !== user.id) {
      throw new ForbiddenException();
    }

    if (appointment.status !== Status.SCHEDULED) {
      throw new ForbiddenException();
    }

    const updated = await this.prismaService.appointment.update({
      where: { id },
      data: { status: Status.COMPLETED },
    });

    const { date, time } = this.formatDateTime(appointment.startAt);

    const mail = appointmentStatusHtml(
      'COMPLETED',
      appointment.consultant.name,
      date,
      time,
    );

    await this.mailService.sendMail({
      to: appointment.client.email,
      subject: mail.subject,
      html: mail.html,
    });

    return updated;
  }

  async getAvailability(consultantId: number, date: string) {
    const [year, month, day] = date.split('-').map(Number);

    // IST "now"
    const nowIST = new Date(
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    );

    const dayInIST = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
    }).format(new Date(date));

    // Sunday check (IST)
    if (dayInIST === "Sun") return [];

    const slots: { start: Date; end: Date }[] = [];

    for (let hr = 10; hr < 19; hr++) {
      //  FORCE IST using +05:30 offset
      const startIST = new Date(
        `${date}T${String(hr).padStart(2, '0')}:00:00+05:30`,
      );

      const endIST = new Date(
        `${date}T${String(hr + 1).padStart(2, '0')}:00:00+05:30`,
      );

      // Skip past slots (IST comparison)
      if (
        startIST.toDateString() === nowIST.toDateString() &&
        startIST <= nowIST
      ) {
        continue;
      }

      slots.push({ start: startIST, end: endIST });
    }

    // Fetch booked slots
    const booked = await this.prismaService.appointment.findMany({
      where: {
        consultantId,
        status: { in: [Status.PENDING, Status.SCHEDULED] },
      },
    });

    return slots.filter(
      (slot) =>
        !booked.some((b) => b.startAt < slot.end && b.endAt > slot.start),
    );
  }
}
