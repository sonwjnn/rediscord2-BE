import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator'
import { Statuses, CleaningDelay } from '@prisma/client'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class AuthUpdateDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  firstName?: string

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  lastName?: string

  @ApiPropertyOptional({ example: 'https://image_url.com' })
  @IsString()
  @IsOptional()
  image?: string

  @ApiPropertyOptional({ example: 'Hello, I am John Doe' })
  @IsString()
  @IsOptional()
  bio?: string

  @IsEnum(Statuses, { message: 'Invalid status' })
  @IsOptional()
  status?: Statuses

  @IsEnum(CleaningDelay, { message: 'Invalid cleaning delay' })
  @IsOptional()
  cleaningDelay?: CleaningDelay

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
