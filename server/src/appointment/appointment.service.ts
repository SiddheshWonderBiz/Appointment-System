import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Role, Status } from '@prisma/client';

import { MailService } from 'src/mail/mail.service';
import {
  appointmentCreatedHtml,
  appointmentStatusHtml,
} from 'src/mail/mail.html-templates';
// import { getISTNow } from 'src/utils/time.util';
import {istToUtc} from 'src/utils/time.util';

@Injectable()
export class AppointmentService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  /* ------------------ HELPERS ------------------ */

  private formatDateTime(date: Date) {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }

  /* ------------------ CREATE ------------------ */

  async createAppointment(
    dto: CreateAppointmentDto,
    user: { id: number; role: Role; name: string },
  ) {
    if (user.role !== Role.CLIENT) {
      throw new ForbiddenException('Only clients can create appointments');
    }

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (startAt >= endAt) {
      throw new ForbiddenException('Invalid appointment time range');
    }

    if (startAt.getDay() === 0) {
      throw new ForbiddenException(
        'Appointments cannot be scheduled on Sundays',
      );
    }

    if (
      startAt.getHours() < 10 ||
      endAt.getHours() > 19 ||
      startAt.getMinutes() !== 0 ||
      endAt.getMinutes() !== 0
    ) {
      throw new ForbiddenException(
        'Appointments must be between 10 AM and 7 PM (full hours only)',
      );
    }

    const conflict = await this.prismaService.appointment.findFirst({
      where: {
        consultantId: dto.consultantId,
        status: { in: [Status.PENDING, Status.SCHEDULED] },
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    });

    if (conflict) {
      throw new ForbiddenException('Consultant is not available for this slot');
    }

    const appointment = await this.prismaService.appointment.create({
      data: {
        consultantId: dto.consultantId,
        clientId: user.id,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        purpose: dto.purpose,
        status: Status.PENDING,
      },
      include: {
        consultant: true,
        client: true,
      },
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
  const [year, month, day] = date.split("-").map(Number);

  // Sunday check (IST-based)
  const istDay = new Date(year, month - 1, day).getDay();
  if (istDay === 0) return [];

  // Current IST time
  const istNow = new Date(
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  );

  const slots: Array<{ start: Date; end: Date }> = [];

  for (let hr = 10; hr < 19; hr++) {
    // Create IST slot but convert to UTC
    const startUtc = istToUtc(year, month, day, hr);
    const endUtc = istToUtc(year, month, day, hr + 1);

    // Skip past slots (IST comparison)
    const slotIst = new Date(year, month - 1, day, hr, 0, 0);

    if (
      slotIst.toDateString() === istNow.toDateString() &&
      slotIst <= istNow
    ) {
      continue;
    }

    slots.push({ start: startUtc, end: endUtc });
  }

  const bookedAppointments = await this.prismaService.appointment.findMany({
    where: {
      consultantId,
      status: { in: [Status.PENDING, Status.SCHEDULED] },
      startAt: {
        gte: slots[0]?.start,
        lte: slots[slots.length - 1]?.end,
      },
    },
  });

  return slots.filter(
    (slot) =>
      !bookedAppointments.some(
        (b) => b.startAt < slot.end && b.endAt > slot.start
      )
  );
}

}
