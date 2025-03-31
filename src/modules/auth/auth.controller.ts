import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { RegisterDto } from './dto/auth.dto';
import { Response } from 'express'
import { LocalAuthGuard } from './guard/local.guard';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res() res: Response) {
    const token = await this.authService.signToken(req.user.id)

    res.setHeader('Authorization', `Bearer ${token}`);

    return res.status(200).json({
      message: 'Login successfully',
      statusCode: 200
    });
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    await this.authService.signup(dto)

    return res.status(200).json({
      message: 'Sign up successfully',
      statusCode: 200
    });
  }
}