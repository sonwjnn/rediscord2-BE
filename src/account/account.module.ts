import { Module, forwardRef } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountsController } from './account.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [AccountsController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
