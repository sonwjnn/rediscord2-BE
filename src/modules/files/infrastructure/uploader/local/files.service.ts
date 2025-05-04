import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AllConfigType } from '@/config/config.type'
import { FileType } from '@/modules/files/domain/file'
import { PrismaService } from '@/modules/prisma'
import { ApiUnprocessableEntityException } from '@/utils/exception'

@Injectable()
export class FilesLocalService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly db: PrismaService,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new ApiUnprocessableEntityException('selectFile')
    }

    return {
      file: await this.db.file.create({
        data: {
          path: `/${this.configService.get('app.apiPrefix', {
            infer: true,
          })}/${file.path}`,
        },
      }),
    }
  }
}
