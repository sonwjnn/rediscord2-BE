import {
  // common
  Module,
} from '@nestjs/common'

import { UserFilesService } from '@/modules/user-files/user-files.service'
import { UserFilesS3Module } from '@/modules/user-files/infrastructure/uploader/s3/files.module'
import { PrismaModule } from '@/modules/prisma'

@Module({
  imports: [
    // import modules, etc.
    UserFilesS3Module,
    PrismaModule,
  ],
  providers: [UserFilesService],
  exports: [UserFilesService],
})
export class UserFilesModule {}
