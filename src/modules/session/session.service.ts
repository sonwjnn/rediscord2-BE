import { Injectable } from '@nestjs/common'

import { NullableType } from '@/utils/types/nullable.type'
import { Session, User } from '@prisma/client'
import { PrismaService } from '@/modules/prisma'

@Injectable()
export class SessionService {
  constructor(private readonly db: PrismaService) {}

  findById(id: Session['id']): Promise<NullableType<Session>> {
    return this.db.session.findUnique({
      where: {
        id,
      },
    })
  }

  create(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Session> {
    return this.db.session.create({
      data,
    })
  }

  update(
    id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session | null> {
    return this.db.session.update({
      where: {
        id,
      },
      data: payload,
    })
  }

  async deleteById(id: Session['id']): Promise<void> {
    await this.db.session.delete({
      where: {
        id,
      },
    })
  }

  async deleteByUserId(conditions: { userId: User['id'] }): Promise<void> {
    await this.db.session.deleteMany({
      where: {
        userId: conditions.userId,
      },
    })
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: User['id']
    excludeSessionId: Session['id']
  }): Promise<void> {
    await this.db.session.deleteMany({
      where: {
        userId: conditions.userId,
        id: {
          not: conditions.excludeSessionId,
        },
      },
    })
  }
}
