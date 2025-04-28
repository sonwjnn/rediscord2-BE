import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class AuthUpdateDto {
  @ApiPropertyOptional({ example: 'https://image_url.com' })
  @IsString()
  @IsOptional()
  image?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  password?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  oldPassword?: string
}
