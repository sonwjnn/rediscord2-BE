import { Injectable } from '@nestjs/common'
import Replicate from 'replicate'
import { ConfigService } from '@nestjs/config'
import { ApiInternalServerException } from '@/utils/exception'
import {
  GenerateImageDto,
  GenerateImageResponseDto,
} from './dto/generate-image.dto'
import { RemoveBgDto, RemoveBgResponseDto } from './dto/remove-bg.dto'
import { HttpService } from '../http/http.service'

@Injectable()
export class ReplicateService {
  private replicate
  constructor(private configService: ConfigService) {
    this.replicate = new Replicate({
      auth: configService.get('replicate.apiToken')!,
    })
  }

  async generateImage({
    prompt,
  }: GenerateImageDto): Promise<GenerateImageResponseDto> {
    console.log({ token: this.configService.get('replicate.apiToken')! })

    const input = {
      cfg: 3.5,
      steps: 28,
      prompt: prompt,
      aspect_ratio: '3:2',
      output_format: 'webp',
      output_quality: 90,
      negative_prompt: '',
      prompt_strength: 0.85,
    }

    const output = await this.replicate.run('stability-ai/stable-diffusion-3', {
      input,
    })

    const res = output as Array<string>

    return { image: res[0] }
  }

  async removeBg({ image }: RemoveBgDto): Promise<RemoveBgResponseDto> {
    const input = {
      image: image,
    }

    const output: unknown = await this.replicate.run(
      'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
      { input },
    )

    const res = output as string

    return { image: res }
  }
}
