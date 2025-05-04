import { Injectable } from '@nestjs/common'

import { FileType } from './domain/file'
import { NullableType } from '@/utils/types/nullable.type'
import { PrismaService } from '@/modules/prisma'

@Injectable()
export class FilesService {
  constructor(private readonly db: PrismaService) {}

  findById(id: FileType['id']): Promise<NullableType<FileType>> {
    return this.db.file.findUnique({
      where: { id },
    })
  }

  findByIds(ids: FileType['id'][]): Promise<FileType[]> {
    return this.db.file.findMany({
      where: { id: { in: ids } },
    })
  }
}
