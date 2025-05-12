import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { UnsplashService } from './unsplash.service'
import { Random } from 'unsplash-js/dist/methods/photos/types'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Unsplash')
@Controller({
  path: 'unsplash',
  version: '1',
})
export class UnsplashController {
  constructor(private readonly unsplashService: UnsplashService) {}

  @Get('search')
  async searchPhotos(@Query('query') query: string): Promise<Random[]> {
    return this.unsplashService.searchPhotos(query)
  }

  @Get('random')
  async getRandomPhoto(): Promise<Random[]> {
    return this.unsplashService.getRandomPhoto()
  }
}
