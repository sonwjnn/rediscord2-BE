import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class AuthGoogleLoginDto {
  @ApiProperty({ example: 'abc' })
  // @IsOptional()
  // idToken: string
  @IsOptional()
  token: string
}
