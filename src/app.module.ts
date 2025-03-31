import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { PrismaModule } from '@/prisma/prisma.module';
import appConfig from './config/app.config';
import authConfig from './auth/config/auth.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        authConfig,
        appConfig,
      ],
      envFilePath: ['.env'],
    }),
    AuthModule, 
    UserModule, 
    PrismaModule
  ],
})
export class AppModule {}
