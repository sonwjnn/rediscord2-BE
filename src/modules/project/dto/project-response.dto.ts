import { ApiProperty } from '@nestjs/swagger'
import { Project } from '@prisma/client'

export class ProjectDto implements Project {
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

  @ApiProperty({ required: false, nullable: true })
  thumbnailUrl: string | null

  @ApiProperty({ required: false, nullable: true })
  isTemplate: boolean | null

  @ApiProperty({ required: false, nullable: true })
  isPro: boolean | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
