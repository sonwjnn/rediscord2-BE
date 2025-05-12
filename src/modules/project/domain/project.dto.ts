import { FileType } from '@/modules/files/domain/file'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

export class ProjectDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  json: string

  @ApiProperty()
  height: number

  @ApiProperty()
  width: number

  @ApiProperty({
    type: String,
    example: 'https://image_url.com',
  })
  thumbnailUrl?: string | null

  @ApiProperty({ required: false, nullable: true })
  isTemplate: boolean | null

  @ApiProperty({ required: false, nullable: true })
  isPro: boolean | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
