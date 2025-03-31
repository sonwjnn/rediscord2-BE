import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { Statuses, CleaningDelay } from '@prisma/client';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsEnum(Statuses, { message: 'Invalid status' })
  @IsOptional()
  status?: Statuses;

  @IsEnum(CleaningDelay, { message: 'Invalid cleaning delay' })
  @IsOptional()
  cleaningDelay?: CleaningDelay;
} 