import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
    constructor(private userService : UserService){}
    
    //To get all consultants by specialty
    @Get('consultants')
    async getAllConsultants(@Query('specialty')   specialty? : string){
        return this.userService.findAllConsultants(specialty);
    }

    //looged in user profile
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getUserProfile (@CurrentUser() user : any){
        return this.userService.findUserById(user.id);
    }

    //update logged in user profile
    @UseGuards(JwtAuthGuard)
    @Patch('update')
    async updateUserProfile (@CurrentUser() user : any, @Body() dto : UpdateUserDto){
        return this.userService.updateUserProfile(user.id , dto);
    }

    

}
