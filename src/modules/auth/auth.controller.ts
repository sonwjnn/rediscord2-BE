import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  SerializeOptions,
  Get,
  Request,
  Patch,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { LoginResponseDto } from './dto/login-response.dto'
import { AuthEmailLoginDto } from './dto/auth-email-login.dto'
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto'
import { AuthGuard } from '@nestjs/passport'
import { DomainUser } from '@/modules/user/domain/user'
import { NullableType } from '@/utils/types/nullable.type'
import { User } from '@prisma/client'
import { RefreshResponseDto } from './dto/refresh-response.dto'
import { AuthUpdateDto } from './dto/auth-update.dto'
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto'
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto'
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto'
import { AuthConfirmEmailResendDto } from './dto/auth-confirm-email-resend.dto'

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.authService.validateLoginByUsernameOrEmail(loginDto)
  }

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  register(@Body() createUserDto: AuthEmailRegisterDto): Promise<void> {
    return this.authService.register(createUserDto)
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  confirmEmail(@Body() confirmEmailDto: AuthConfirmEmailDto): Promise<void> {
    return this.authService.confirmEmail(confirmEmailDto.token)
  }

  @Post('email/confirm/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  resendConfirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailResendDto,
  ): Promise<void> {
    return this.authService.resendVerificationConfirmEmail(
      confirmEmailDto.email,
    )
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email)
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    )
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: DomainUser,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.authService.me(request.user)
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<RefreshResponseDto> {
    return this.authService.refreshToken({
      sessionId: request.user.sessionId,
      sessionToken: request.user.sessionToken,
    })
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public logout(@Request() request): Promise<void> {
    return this.authService.logout({
      sessionId: request.user.sessionId,
    })
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: DomainUser,
  })
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    return this.authService.update(request.user, userDto)
  }
}
