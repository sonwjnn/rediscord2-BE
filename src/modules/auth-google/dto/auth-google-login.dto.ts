import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class AuthGoogleLoginDto {
  @ApiProperty({ example: 'abc' })
  @IsNotEmpty()
  // idToken: string
  @IsOptional()
  accessToken: string
}
