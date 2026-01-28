import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService,PrismaService,MailService,RedisService]
})
export class AppointmentModule {}
