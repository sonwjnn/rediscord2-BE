import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserModule } from '@/modules/user/user.module'
import { PrismaModule, PrismaService } from '@/modules/prisma'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { SessionModule } from '@/modules/session/session.module'
import { MailModule } from '@/modules/mail/mail.module'

@Module({
  imports: [
    SessionModule,
    UserModule,
    PassportModule,
    MailModule,
    PrismaModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
