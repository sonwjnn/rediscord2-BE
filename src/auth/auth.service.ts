import * as ms from 'ms'
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Injectable, Inject, forwardRef, UnprocessableEntityException, HttpStatus } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { verifyPassword } from '@/helpers/password';
import { PrismaService } from "@/prisma";
import { v4 as uuidv4 } from 'uuid';
import { AuthLoginDto } from "./dto/auth-login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { AuthProvidersEnum, Session, User } from "@prisma/client";
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { SessionService } from "@/session/session.service";
import { ConfigService } from "@nestjs/config";
import { AllConfigType } from "@/config/config.type";
import { AuthRegisterLoginDto } from "./dto/auth-register.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private db: PrismaService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password) {
      const isValid = await verifyPassword(password, user.password);
      if (isValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async validateUserById(id: string): Promise<any> {
    const user = await this.userService.findById(id);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateLogin(loginDto: AuthLoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'notFound',
        },
      });
    }

    if (user.provider !== AuthProvidersEnum.EMAIL) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: `needLoginViaProvider:${user.provider}`,
        },
      });
    }

    if (!user.password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      userId: user.id,
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const user = await this.userService.create({
      ...dto,
      email: dto.email,
    });

    // const hash = await this.jwtService.signAsync(
    //   {
    //     confirmEmailUserId: user.id,
    //   },
    //   {
    //     secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
    //       infer: true,
    //     }),
    //     expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
    //       infer: true,
    //     }),
    //   },
    // );

    // await this.mailService.userSignUp({
    //   to: dto.email,
    //   data: {
    //     hash,
    //   },
    // });
  }

  private async getTokensData(data: {
    id: User['id'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
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
          hash: data.hash,
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
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async signToken(
    userId: string,
  ) {
    const payload = {
      sub: userId,
      version: uuidv4()
    };

    const token = await this.jwtService.signAsync(
      payload,
    );

    return token
  }
}
