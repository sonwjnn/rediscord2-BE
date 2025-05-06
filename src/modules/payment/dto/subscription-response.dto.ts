import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsString,
  IsDate,
} from 'class-validator'

export class SubscriptionResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subscriptionId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  priceId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string

  @ApiProperty({ required: false, nullable: true })
  @IsDate()
  @IsOptional()
  currentPeriodEnd: Date | null

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  active: boolean
}
