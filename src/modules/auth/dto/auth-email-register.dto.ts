import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer'

export class AuthEmailRegisterDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string

  @ApiProperty()
  @MinLength(6)
  password: string

  @ApiProperty({ example: 'sonwin111' })
  @IsNotEmpty()
  username: string
}
