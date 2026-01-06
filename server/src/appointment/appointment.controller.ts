import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Role } from '@prisma/client';

@Controller('appointment')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  //create appointment
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createAppointment(
    @CurrentUser() user: { id: number; role: Role , name: string },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentService.createAppointment(dto, user);
  }

  //get my appointments
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myAppointments(@CurrentUser() user: { id: number; role: Role }) {
    return this.appointmentService.myAppointments(user);
  }

  //get my prev appointments
  @UseGuards(JwtAuthGuard)
  @Get('me/history')
  async myPreviousAppointments(@CurrentUser() user: { id: number; role: Role }) {
    return this.appointmentService.myPrevAppointments(user);
  }

  //get consultant appointments
  @UseGuards(JwtAuthGuard)
  @Get('consultant')
  async consultantAppointments(
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.appointmentService.consultantAppointments(user);
  }

    @UseGuards(JwtAuthGuard)
  @Get('consultant/history')
  async consultantPrevAppointments(
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.appointmentService.consultantPrevAppointments(user);
  }

  //accept appointment
  @UseGuards(JwtAuthGuard)
  @Patch('accept/:id')
  async acceptAppointment(
    @Param('id') id: string,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.appointmentService.acceptAppointment(+id, user);
  }

  //reject appointment
  @UseGuards(JwtAuthGuard)
  @Patch('reject/:id')
  async rejectAppointment(
    @CurrentUser() user: { id: number; role: Role },
    @Param('id') appointmentId: string,
  ) {
    return this.appointmentService.rejectAppointment(+appointmentId, user);
  }

  //cancel appointment
  @UseGuards(JwtAuthGuard)
  @Patch('cancel/:id')
  async cancelAppointment(
    @CurrentUser() user: { id: number; role: Role },
    @Param('id') appointmentId: string,
  ) {
    return this.appointmentService.cancelAppointment(+appointmentId, user);
  }

  //complete appointment
  @UseGuards(JwtAuthGuard)
  @Patch('complete/:id')
  async completeAppointment(
    @CurrentUser() user: { id: number; role: Role },
    @Param('id') appointmentId: string,
  ) {
    return this.appointmentService.completeAppointment(+appointmentId, user);
  }

  //availbility 
  @UseGuards(JwtAuthGuard)
  @Get('availability/:consultantId/')
  async getAvailability(
    @Param('consultantId') consultantId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentService.getAvalibility(+consultantId, date);
  }
}
