import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class AuthConfirmEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string
}
