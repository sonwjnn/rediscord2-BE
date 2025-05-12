import { Injectable } from '@nestjs/common'

import { UserFileType } from './domain/user-file'
import { NullableType } from '@/utils/types/nullable.type'
import { PrismaService } from '@/modules/prisma'

@Injectable()
export class UserFilesService {
  constructor(private readonly db: PrismaService) {}

  findById(id: UserFileType['id']): Promise<NullableType<UserFileType>> {
    return this.db.userFiles.findUnique({
      where: { id },
    })
  }

  findByUserId(userId: string): Promise<NullableType<UserFileType[]>> {
    return this.db.userFiles.findMany({
      where: { userId, fileType: 'DESIGN' },
    })
  }
}
