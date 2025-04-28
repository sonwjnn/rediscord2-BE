import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserModule } from '@/modules/user/user.module'
import { PrismaService } from '@/modules/prisma'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { SessionModule } from '@/modules/session/session.module'
import { MailModule } from '@/modules/mail/mail.module'

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
