import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ReplicateService } from './replicate.service'

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import {
  GenerateImageDto,
  GenerateImageResponseDto,
} from './dto/generate-image.dto'
import { RemoveBgDto, RemoveBgResponseDto } from './dto/remove-bg.dto'

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Replicate')
@Controller({
  path: 'replicate',
  version: '1',
})
export class ReplicateController {
  constructor(private readonly replicateService: ReplicateService) {}

  @Post('generate-image')
  async generateImage(
    @Body() generateImageDto: GenerateImageDto,
  ): Promise<GenerateImageResponseDto> {
    return this.replicateService.generateImage(generateImageDto)
  }

  @Post('remove-bg')
  async removeBg(
    @Body() removeBgDto: RemoveBgDto,
  ): Promise<RemoveBgResponseDto> {
    return this.replicateService.removeBg(removeBgDto)
  }
}
