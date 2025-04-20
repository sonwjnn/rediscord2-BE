import { ApiProperty } from '@nestjs/swagger'

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string

  @ApiProperty()
  refreshToken: string

  @ApiProperty()
  tokenExpires: number
}
