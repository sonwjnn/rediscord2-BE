import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { UserModule } from '@/modules/user/user.module'
import { PrismaModule } from '@/modules/prisma'

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
