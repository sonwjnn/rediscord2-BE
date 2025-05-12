import { Injectable } from '@nestjs/common'
import { UserFileType } from '@/modules/user-files/domain/user-file'
import { PrismaService } from '@/modules/prisma'
import { ApiUnprocessableEntityException } from '@/utils/exception'
import { UserFileTypeEnum } from '@prisma/client'

@Injectable()
export class UserFilesS3Service {
  constructor(private readonly db: PrismaService) {}

  async create(
    file: Express.MulterS3.File,
    userId: string,
    fileType: string,
  ): Promise<{ file: UserFileType }> {
    if (!file) {
      throw new ApiUnprocessableEntityException('selectFile')
    }

    if (
      !Object.values(UserFileTypeEnum).includes(fileType as UserFileTypeEnum)
    ) {
      throw new ApiUnprocessableEntityException('invalidFileType')
    }

    return {
      file: await this.db.userFiles.create({
        data: {
          userId,
          path: file.key,
          fileType: fileType as UserFileTypeEnum,
        },
      }),
    }
  }
}
