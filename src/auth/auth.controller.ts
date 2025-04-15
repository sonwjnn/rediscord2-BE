import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Public } from './decorator/public.decorator'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { LoginResponseDto } from './dto/login-response.dto'
import { AuthEmailLoginDto } from './dto/auth-email-login.dto'
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto'

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.authService.validateLoginByUsernameOrEmail(loginDto)
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() createUserDto: AuthEmailRegisterDto): Promise<void> {
    return this.authService.register(createUserDto)
  }
}
