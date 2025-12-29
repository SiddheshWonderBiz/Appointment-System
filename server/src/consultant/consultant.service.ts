import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ConsultantService {
    constructor(private prismaService : PrismaService) { }

    async getAllConsultants() {
    return this.prismaService.user.findMany({
      where: { role: Role.CONSULTANT },
      select: {
        id: true,
        name: true,
        specialty: true,
      },
    });
  }
}
