import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty()
  user: User;
}