import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string | null

  @ApiProperty()
  @MinLength(6)
  password?: string

  @IsDate()
  @IsOptional()
  emailVerified?: Date | null

  @ApiProperty({ example: 'sonwin111', type: String })
  @IsString()
  @IsOptional()
  name?: string | null
}
