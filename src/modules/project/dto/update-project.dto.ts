import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator'

export class UpdateProjectDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  json?: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  width?: number

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  height?: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thumbnailId?: string

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPro?: boolean
}
