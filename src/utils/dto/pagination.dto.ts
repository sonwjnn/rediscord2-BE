import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, Min } from 'class-validator'

export class PaginationDto {
  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number

  @ApiProperty({ default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number
}