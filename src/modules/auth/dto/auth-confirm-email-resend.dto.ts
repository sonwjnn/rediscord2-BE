import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class AuthConfirmEmailResendDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string
}
