import { DomainUser } from '@/user/domain/user'
import { ApiProperty } from '@nestjs/swagger'

export class LoginResponseDto {
  @ApiProperty()
  token: string

  @ApiProperty()
  refreshToken: string

  @ApiProperty()
  tokenExpires: number
}
