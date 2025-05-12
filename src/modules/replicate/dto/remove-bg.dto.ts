import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class RemoveBgDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image: string
}

export class RemoveBgResponseDto {
  @ApiProperty()
  image: string
}
