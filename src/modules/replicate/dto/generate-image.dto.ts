import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class GenerateImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prompt: string
}

export class GenerateImageResponseDto {
  @ApiProperty()
  image: string
}
