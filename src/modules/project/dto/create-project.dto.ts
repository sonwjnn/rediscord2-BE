import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsNumber } from 'class-validator'

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  json: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  width: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  height: number
}
