import { Module } from '@nestjs/common'
import { UserFilesS3Controller } from './files.controller'
import { MulterModule } from '@nestjs/platform-express'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import { S3Client } from '@aws-sdk/client-s3'
import multerS3, { AUTO_CONTENT_TYPE } from 'multer-s3'

import { UserFilesS3Service } from './files.service'
import { AllConfigType } from '@/config/config.type'
import { PrismaModule } from '@/modules/prisma'
import { ApiUnprocessableEntityException } from '@/utils/exception'
import { UserFilesService } from '@/modules/user-files/user-files.service'

@Module({
  imports: [
    PrismaModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const s3 = new S3Client({
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

        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              return callback(
                new ApiUnprocessableEntityException('cantUploadFileType'),
                false,
              )
            }

            callback(null, true)
          },
          storage: multerS3({
            s3: s3,
            bucket: configService.getOrThrow('file.awsDefaultS3Bucket', {
              infer: true,
            }),
            contentType: AUTO_CONTENT_TYPE,
            key: (request, file, callback) => {
              callback(
                null,
                `${randomStringGenerator()}.${file.originalname
                  .split('.')
                  .pop()
                  ?.toLowerCase()}`,
              )
            },
          }),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
          },
        }
      },
    }),
  ],
  controllers: [UserFilesS3Controller],
  providers: [UserFilesS3Service, UserFilesService],
  exports: [UserFilesS3Service],
})
export class UserFilesS3Module {}
