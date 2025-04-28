import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { Account } from '@prisma/client'
import { NullableType } from '@/utils/types/nullable.type'

@Injectable()
export class AccountService {
  constructor(private readonly db: PrismaService) {}

  findByUserId(userId: string): Promise<NullableType<Account>> {
    return this.db.account.findFirst({
      where: { userId },
    })
  }
}
