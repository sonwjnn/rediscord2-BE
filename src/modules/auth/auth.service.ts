import ms from 'ms'
import * as crypto from 'crypto'
import * as bcrypt from 'bcryptjs'
import {
  Injectable,
  Inject,
  forwardRef,
  UnprocessableEntityException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '@/modules/user/user.service'
import { PrismaService } from '@/modules/prisma'
import { AuthEmailLoginDto } from './dto/auth-email-login.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { Session, User } from '@prisma/client'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import { SessionService } from '@/modules/session/session.service'
import { ConfigService } from '@nestjs/config'
import { AllConfigType } from '@/config/config.type'
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto'
import { JwtPayloadType } from './strategies/types/jwt-payload.type'
import { NullableType } from '@/utils/types/nullable.type'
import { AuthUpdateDto } from './dto/auth-update.dto'
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type'
import { MailService } from '@/modules/mail/mail.service'
import { v4 as uuidv4 } from 'uuid'
import {
  ApiBadRequestException,
  ApiNotFoundException,
  ApiUnauthorizedException,
  ApiUnprocessableEntityException,
} from '@/utils/exception'
import { SocialInterface } from '@/modules/social/interfaces/social.interface'
import { RefreshResponseDto } from './dto/refresh-response.dto'
import { addHours, addMinutes, addSeconds } from 'date-fns'
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
      throw new ApiNotFoundException('userNotFound')
    }

    if (!exisingUser.emailVerified) {
      throw new ApiUnauthorizedException('emailNotVerified')
    }

    if (!exisingUser.password) {
      throw new ApiNotFoundException('isSocialAccount')
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      exisingUser.password,
    )

    if (!isValidPassword) {
      throw new ApiBadRequestException('incorrectPassword')
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

  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    let user: NullableType<User> = null
    const socialEmail = socialData.email?.toLowerCase()
    let userByEmail: NullableType<User> = null

    if (socialEmail) {
      userByEmail = await this.userService.findByEmail(socialEmail)
    }

    if (userByEmail && !!userByEmail.password) {
      throw new ApiUnprocessableEntityException('credentialExists')
    }

    if (socialData.id) {
      user = await this.userService.findBySocialIdAndProvider({
        socialId: socialData.id,
        provider: authProvider,
      })
    }

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail
        user.emailVerified = new Date()
      }
      if (userByEmail && !user.emailVerified) {
        user.emailVerified = new Date()
      }
      await this.userService.update(user.id, user)
    } else if (userByEmail) {
      user = userByEmail
    } else if (socialData.id) {
      const firstName = socialData.firstName || ''
      const lastName = socialData.lastName || ''
      const name = `${firstName} ${lastName}`.trim()

      user = await this.userService.create({
        email: socialEmail ?? null,
        name,
        emailVerified: new Date(),
      })

      await this.db.account.create({
        data: {
          userId: user.id,
          type: socialData.type,
          provider: authProvider,
          providerAccountId: socialData.id,
        },
      })

      user = await this.userService.findById(user.id)
    }

    if (!user) {
      throw new ApiNotFoundException('userNotFound')
    }

    const sessionToken = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex')

    const expires = addSeconds(new Date(), 30)

    const session = await this.sessionService.create({
      userId: user.id,
      sessionToken,
      expires,
    })

    const {
      accessToken: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.getTokensData({
      id: user.id,
      sessionId: session.id,
      sessionToken,
    })

    return {
      refreshToken,
      accessToken: jwtToken,
      tokenExpires,
    }
  }

  async register(dto: AuthEmailRegisterDto): Promise<void> {
    const user = await this.userService.create({
      ...dto,
      email: dto.email,
    })

    const { token, expires } = await this.generateVerificationToken(user.email)

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        token,
        tokenExpires: expires,
        email: dto.email,
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
      throw new ApiNotFoundException('userNotFound')
    }

    if (userDto.password) {
      if (!userDto.oldPassword) {
        throw new ApiNotFoundException('oldPasswordNotFound')
      }

      if (!currentUser.password) {
        throw new ApiNotFoundException('passwordNotFound')
      }

      const isValidOldPassword = await bcrypt.compare(
        userDto.oldPassword,
        currentUser.password,
      )

      if (!isValidOldPassword) {
        throw new ApiBadRequestException('incorrectOldPassword')
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
      throw new ApiBadRequestException('tokenNotFound')
    }

    const hasExpired = new Date(existingToken.expires) < new Date()

    if (hasExpired) {
      throw new ApiBadRequestException('tokenExpired')
    }

    const user = await this.userService.findByEmail(existingToken.email)

    if (!user) {
      throw new ApiNotFoundException('userNotFound')
    }

    if (user.emailVerified) {
      throw new ApiBadRequestException('emailVerified')
    }

    user.emailVerified = new Date()

    await this.userService.update(user.id, user)

    await this.db.verificationToken.deleteMany({
      where: {
        email: user.email,
      },
    })
  }

  async resendVerificationConfirmEmail(email: string): Promise<void> {
    const existingToken = await this.db.verificationToken.findFirst({
      where: { email },
    })

    if (existingToken) {
      const updatedToken = await this.db.verificationToken.update({
        where: { id: existingToken.id },
        data: { expires: addSeconds(new Date(), 30) },
      })

      await this.mailService.userSignUp({
        to: email,
        data: {
          token: updatedToken.token,
          tokenExpires: updatedToken.expires,
          email,
        },
      })
    }

    const { token, expires } = await this.generateVerificationToken(email)

    await this.mailService.userSignUp({
      to: email,
      data: {
        token,
        tokenExpires: expires,
        email: email,
      },
    })
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email)

    if (!user) {
      throw new ApiNotFoundException('emailNotExists')
    }

    const { token, expires } = await this.generatePasswordResetToken(user.email)

    await this.mailService.forgotPassword({
      to: email,
      data: {
        token,
        tokenExpires: expires,
      },
    })
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    const existingToken = await this.db.passwordResetToken.findFirst({
      where: {
        token: hash,
      },
    })

    if (!existingToken) {
      throw new ApiBadRequestException('tokenNotFound')
    }

    const user = await this.userService.findByEmail(existingToken.email)

    if (!user) {
      throw new ApiNotFoundException('userNotFound')
    }

    if (!user.password) {
      throw new ApiBadRequestException('isSocialAccount')
    }

    const comparePassword = await bcrypt.compare(password, user.password)

    if (comparePassword) {
      throw new ApiBadRequestException('samePassword')
    }

    user.password = password

    await this.sessionService.deleteByUserId({
      userId: user.id,
    })

    await this.userService.update(user.id, user)

    await this.db.passwordResetToken.deleteMany({
      where: {
        email: user.email,
      },
    })
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'sessionToken'>,
  ): Promise<Omit<RefreshResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId)

    if (!session) {
      throw new ApiNotFoundException('sessionNotFound')
    }

    if (session.sessionToken !== data.sessionToken) {
      throw new ApiBadRequestException('incorrectToken')
    }

    if (new Date() > new Date(session.expires)) {
      await this.sessionService.deleteById(session.id)
      throw new ApiUnauthorizedException('sessionExpired')
    }

    const sessionToken = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex')

    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Extend session for another 24 hours

    const user = await this.userService.findById(session.userId)

    if (!user) {
      throw new ApiNotFoundException('userNotFound')
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
  //   await this.userService.remove(user.id);
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

  private async generateVerificationToken(email: string): Promise<{
    token: string
    expires: Date
  }> {
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
    const expires = addMinutes(new Date(), 5)

    await this.db.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    return {
      token,
      expires,
    }
  }

  private async generatePasswordResetToken(email: string): Promise<{
    token: string
    expires: Date
  }> {
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
    const expires = addMinutes(new Date(), 5)

    await this.db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    return {
      token,
      expires,
    }
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
