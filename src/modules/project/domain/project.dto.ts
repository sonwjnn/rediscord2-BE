import { FileType } from '@/modules/files/domain/file'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

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
    type: () => FileType,
  })
  thumbnail?: FileType | null

  @Exclude()
  thumbnailId?: string | null

  @ApiProperty({ required: false, nullable: true })
  isTemplate: boolean | null

  @ApiProperty({ required: false, nullable: true })
  isPro: boolean | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
