import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer'
import { ApiProperty } from '@nestjs/swagger'
import { AuthProvidersEnum } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string | null

  @ApiProperty()
  @MinLength(6)
  password?: string

  provider?: AuthProvidersEnum

  socialId?: string | null

  @ApiProperty({ example: 'sonwin111', type: String })
  @IsNotEmpty()
  name: string | null
}
