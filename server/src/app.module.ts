import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ConsultantController } from './consultant/consultant.controller';
import { ConsultantModule } from './consultant/consultant.module';

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }),AuthModule, PrismaModule, UserModule, AppointmentModule, ConsultantModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
