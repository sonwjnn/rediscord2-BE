import { IsDate, IsString, IsOptional } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  image?: string | null

  @IsString()
  @IsOptional()
  name?: string | null

  @IsDate()
  @IsOptional()
  emailVerified?: Date | null

  @IsString()
  @IsOptional()
  password?: string | null
}
