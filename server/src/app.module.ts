import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }),AuthModule, PrismaModule, UserModule, AppointmentModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
