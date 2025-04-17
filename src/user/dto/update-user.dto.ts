import { IsDate, IsString, IsOptional, IsEnum } from 'class-validator'
import { Statuses, CleaningDelay } from '@prisma/client'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string | null

  @IsString()
  @IsOptional()
  lastName?: string | null

  @IsString()
  @IsOptional()
  image?: string | null

  @IsString()
  @IsOptional()
  bio?: string | null

  @IsDate()
  @IsOptional()
  emailVerified?: Date | null

  @IsEnum(Statuses, { message: 'Invalid status' })
  @IsOptional()
  status?: Statuses

  @IsEnum(CleaningDelay, { message: 'Invalid cleaning delay' })
  @IsOptional()
  cleaningDelay?: CleaningDelay

  @IsString()
  @IsOptional()
  password?: string | null
}
