import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class VerificationService {
  constructor(private readonly db: PrismaService) {}

  async generateEmailVerificationToken(email: string): Promise<string> {
    const existingToken = await this.getVerificationTokenByEmail(email)

    if (existingToken) {
      await this.db.verificationToken.deleteMany({
        where: {
          email,
        },
      })
    }

    const token = uuidv4()
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)

    await this.db.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    return token
  }

  getVerificationTokenByEmail(email: string) {
    return this.db.verificationToken.findFirst({
      where: {
        email,
      },
    })
  }
}
