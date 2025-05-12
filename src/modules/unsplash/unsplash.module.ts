import { Module } from '@nestjs/common'
import { UnsplashService } from './unsplash.service'
import { UnsplashController } from './unsplash.controller'

@Module({
  controllers: [UnsplashController],
  providers: [UnsplashService],
  exports: [UnsplashService],
})
export class UnsplashModule {}
