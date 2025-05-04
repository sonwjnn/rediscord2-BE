import { forwardRef, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UsersController } from './user.controller'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { FilesModule } from '@/modules/files/files.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, FilesModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
