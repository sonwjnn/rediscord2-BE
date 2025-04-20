import ms from 'ms'
import * as crypto from 'crypto'
import * as bcrypt from 'bcryptjs'
import {
  Injectable,
  Inject,
  forwardRef,
  UnprocessableEntityException,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '@/user/user.service'
import { PrismaService } from '@/prisma'
import { AuthEmailLoginDto } from './dto/auth-email-login.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { Session, User } from '@prisma/client'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import { SessionService } from '@/session/session.service'
import { ConfigService } from '@nestjs/config'
import { AllConfigType } from '@/config/config.type'
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto'
import { JwtPayloadType } from './strategies/types/jwt-payload.type'
import { NullableType } from '@/utils/types/nullable.type'
import { AuthUpdateDto } from './dto/auth-update.dto'
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type'
import { MailService } from '@/mail/mail.service'
import { v4 as uuidv4 } from 'uuid'
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private db: PrismaService,
    private configService: ConfigService<AllConfigType>,
    private mailService: MailService,
  ) {}

  async validateLoginByUsernameOrEmail(
    loginDto: AuthEmailLoginDto,
  ): Promise<LoginResponseDto> {
    const exisingUser = await this.userService.findByUsernameOrEmail(
      loginDto.usernameOrEmail,
    )

    if (!exisingUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'notFound',
        },
      })
    }

    if (!exisingUser.emailVerified) {
      const token = await this.generateVerificationToken(exisingUser.email)

      await this.mailService.userSignUp({
        to: exisingUser.email,
        data: {
          token,
        },
      })

      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotVerified',
        },
      })
    }

    if (!exisingUser.password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      })
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      exisingUser.password,
    )

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      })
    }

    const sessionToken = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex')

    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Session expires in 24 hours

    const session = await this.sessionService.create({
      userId: exisingUser.id,
      sessionToken,
      expires,
    })

    const { accessToken, refreshToken, tokenExpires } =
      await this.getTokensData({
        id: exisingUser.id,
        sessionId: session.id,
        sessionToken,
      })

    return {
      refreshToken,
      accessToken,
      tokenExpires,
    }
  }

  async register(dto: AuthEmailRegisterDto): Promise<void> {
    const user = await this.userService.create({
      ...dto,
      email: dto.email,
    })

    const token = await this.generateVerificationToken(user.email)

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        token,
      },
    })
  }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.userService.findById(userJwtPayload.id)
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    const currentUser = await this.userService.findById(userJwtPayload.id)

    if (!currentUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      })
    }

    if (userDto.password) {
      if (!userDto.oldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'missingOldPassword',
          },
        })
      }

      if (!currentUser.password) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        })
      }

      const isValidOldPassword = await bcrypt.compare(
        userDto.oldPassword,
        currentUser.password,
      )

      if (!isValidOldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        })
      } else {
        await this.sessionService.deleteByUserIdWithExclude({
          userId: currentUser.id,
          excludeSessionId: userJwtPayload.sessionId,
        })
      }
    }

    delete userDto.oldPassword

    await this.userService.update(userJwtPayload.id, userDto)

    return this.userService.findById(userJwtPayload.id)
  }

  async confirmEmail(hash: string): Promise<void> {
    const existingToken = await this.db.verificationToken.findFirst({
      where: {
        token: hash,
      },
    })

    if (!existingToken) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      })
    }

    const hasExpired = new Date(existingToken.expires) < new Date()

    if (hasExpired) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      })
    }

    const user = await this.userService.findByEmail(existingToken.email)

    if (!user || user?.emailVerified) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      })
    }

    user.emailVerified = new Date()

    await this.userService.update(user.id, user)
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email)

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotExists',
        },
      })
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true,
    })

    const tokenExpires = Date.now() + ms(tokenExpiresIn)

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: tokenExpiresIn,
      },
    )

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires,
      },
    })
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: User['id']

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: User['id']
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      })

      userId = jwtData.forgotUserId
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      })
    }

    const user = await this.userService.findById(userId)

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `notFound`,
        },
      })
    }

    user.password = password

    await this.sessionService.deleteByUserId({
      userId: user.id,
    })

    await this.userService.update(user.id, user)
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'sessionToken'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId)

    if (!session) {
      throw new UnauthorizedException()
    }

    if (session.sessionToken !== data.sessionToken) {
      throw new UnauthorizedException()
    }

    // Check if session has expired
    if (new Date() > new Date(session.expires)) {
      await this.sessionService.deleteById(session.id)
      throw new UnauthorizedException('Session has expired')
    }

    const sessionToken = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex')

    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Extend session for another 24 hours

    const user = await this.userService.findById(session.userId)

    if (!user) {
      throw new UnauthorizedException()
    }

    await this.sessionService.update(session.id, {
      sessionToken,
      expires,
    })

    const { accessToken, refreshToken, tokenExpires } =
      await this.getTokensData({
        id: session.userId,
        sessionId: session.id,
        sessionToken,
      })

    return {
      accessToken,
      refreshToken,
      tokenExpires,
    }
  }

  // async softDelete(user: User): Promise<void> {
  //   await this.usersService.remove(user.id);
  // }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.deleteById(data.sessionId)
  }

  private async getTokensData(data: {
    id: User['id']
    sessionId: Session['id']
    sessionToken: Session['sessionToken']
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    })

    const tokenExpires = Date.now() + ms(tokenExpiresIn)

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          sessionToken: data.sessionToken,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ])

    return {
      accessToken,
      refreshToken,
      tokenExpires,
    }
  }

  private async generateVerificationToken(email: string): Promise<string> {
    const existingToken = await this.db.verificationToken.findFirst({
      where: {
        email,
      },
    })

    if (existingToken) {
      await this.db.verificationToken.deleteMany({
        where: {
          email,
        },
      })
    }

    const token = uuidv4()
    const expires = new Date()
    expires.setMinutes(expires.getMinutes() + 5) // 5 minutes

    await this.db.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    return token
  }

  private async generatePasswordResetToken(email: string): Promise<string> {
    const existingToken = await this.db.passwordResetToken.findFirst({
      where: {
        email,
      },
    })

    if (existingToken) {
      await this.db.passwordResetToken.deleteMany({
        where: {
          email,
        },
      })
    }

    const token = uuidv4()
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)

    await this.db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    return token
  }

  private async generateTwoFactorToken(email: string): Promise<string> {
    const existingToken = await this.db.twoFactorToken.findFirst({
      where: {
        email,
      },
    })

    if (existingToken) {
      await this.db.twoFactorToken.deleteMany({
        where: {
          email,
        },
      })
    }

    const token = uuidv4()
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)

    await this.db.twoFactorToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    return token
  }
}
