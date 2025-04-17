import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserModule } from '@/user/user.module'
import { PrismaService } from '@/prisma'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { SessionModule } from '@/session/session.module'
import { MailModule } from '@/mail/mail.module'

@Module({
  imports: [
    SessionModule,
    UserModule,
    PassportModule,
    MailModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
