import { Module } from '@nestjs/common'
import { VerificationService } from './reset-password.service'
import { PrismaModule } from '@/prisma/prisma.module'
import { MailModule } from '@/mail/mail.module'
import { PrismaService } from '@/prisma'

@Module({
  imports: [PrismaModule, MailModule],
  providers: [VerificationService],
  exports: [VerificationService, PrismaService],
})
export class VerificationModule {}
