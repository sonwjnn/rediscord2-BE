import { Injectable } from '@nestjs/common'
import { FileUploadDto } from './dto/file.dto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import { ConfigService } from '@nestjs/config'
import { FileType } from '@/modules/files/domain/file'
import { AllConfigType } from '@/config/config.type'
import { PrismaService } from '@/modules/prisma'
import {
  ApiPayloadTooLargeException,
  ApiUnprocessableEntityException,
} from '@/utils/exception'

@Injectable()
export class FilesS3PresignedService {
  private s3: S3Client

  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.s3 = new S3Client({
      region: configService.get('file.awsS3Region', { infer: true }),
      credentials: {
        accessKeyId: configService.getOrThrow('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: configService.getOrThrow('file.secretAccessKey', {
          infer: true,
        }),
      },
    })
  }

  async create(
    file: FileUploadDto,
  ): Promise<{ file: FileType; uploadSignedUrl: string }> {
    if (!file) {
      throw new ApiUnprocessableEntityException('selectFile')
    }

    if (!file.fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      throw new ApiUnprocessableEntityException('cantUploadFileType')
    }

    if (
      file.fileSize >
      (this.configService.get('file.maxFileSize', {
        infer: true,
      }) || 0)
    ) {
      throw new ApiPayloadTooLargeException('fileTooLarge')
    }

    const key = `${randomStringGenerator()}.${file.fileName
      .split('.')
      .pop()
      ?.toLowerCase()}`

    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow('file.awsDefaultS3Bucket', {
        infer: true,
      }),
      Key: key,
      ContentLength: file.fileSize,
    })
    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 })
    const data = await this.db.file.create({
      data: {
        path: key,
      },
    })

    return {
      file: data,
      uploadSignedUrl: signedUrl,
    }
  }
}
