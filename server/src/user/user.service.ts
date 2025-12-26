import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { contains } from 'class-validator';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  //find consultants by specialty
  async findAllConsultants(specialty?: string) {
    const where:any = { role: Role.CONSULTANT, ...(specialty ? {specialty : {contains   : specialty, mode: 'insensitive'}} : {}) };
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  //get user by id
  async findUserById(id: number) {
    const user =  this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        role: true, 
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
   //update user
   async updateUserProfile(userId : number , dto : UpdateUserDto){
    const user = await this.prisma.user.update({
      where: {id : userId},
      data : dto,
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        role: true, 
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
   }

   //find user by email
   async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
   }
}
