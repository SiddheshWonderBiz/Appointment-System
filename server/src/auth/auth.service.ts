import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    // Auth service methods would go here
    constructor(
        private prisma : PrismaService,
        private jwt : JwtService
    ){}

    async register(data : RegisterDto){
        const {name , email , password , role , specialty} = data;

        const existing = await this.prisma.user.findUnique({
            where: {email}
        })
        if(existing){
            throw new ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password , 10);

        const user = await this.prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword,
                role,
                specialty: role === 'CONSULTANT' ? specialty : null
            },
            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                specialty:true,
                createdAt:true
            }
        });
        return{
            message: 'User registered successfully',
            user
        }
    }

    async login(data : LoginDto){

        const {email , password} = data;

        const user = await this.prisma.user.findUnique({
            where: {email}
        })

        if(!user){
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password , user.password);
        if(!isPasswordValid){
            throw new UnauthorizedException('Invalid credentials');
        }   
        const payload ={
            id : user.id,
            email : user.email,
            name : user.name,
            role : user.role
        }

        const token =  await this.jwt.sign(payload);
 
        return{
            message: 'Login successful',
            access_token : token
        }
    }
}
