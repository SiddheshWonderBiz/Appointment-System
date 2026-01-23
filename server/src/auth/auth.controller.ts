import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { max, min } from 'class-validator';
import { CurrentUser } from './decorator/current-user.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //User Registration
  @Post('register')
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  //User Login
  @Post('login')
  async login(@Body() data: LoginDto, @Res({ passthrough: true }) res: any) {
    const { access_token } = await this.authService.login(data);

    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: true,
      sameSite : 'none',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Login successful', };
  }

  //logout 
  @Post('logout')
  async logout(@Res({passthrough:true}) res : any){
    res.clearCookie('jwt');
    return {
        message: 'Logout successful'
    }
  }

  //Current User
  @UseGuards(JwtAuthGuard)
  @Post('me')
  async me(@CurrentUser() user: any) {
    return user;
  }

  
}
