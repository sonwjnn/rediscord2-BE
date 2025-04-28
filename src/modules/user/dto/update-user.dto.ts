import { IsDate, IsString, IsOptional } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  image?: string | null

  @IsDate()
  @IsOptional()
  emailVerified?: Date | null

  @IsString()
  @IsOptional()
  password?: string | null
}
