import { IsEmail, IsString,  MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @MinLength(5, { message: 'Username must be at least 6 characters long' })
  name: string;
} 