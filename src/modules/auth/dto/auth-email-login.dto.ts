import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { Transform } from 'class-transformer'
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer'

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'test1@example.com or username', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  usernameOrEmail: string

  @ApiProperty()
  @IsNotEmpty()
  password: string
}
