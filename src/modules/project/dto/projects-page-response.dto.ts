import { ApiProperty } from '@nestjs/swagger'
import { ProjectDto } from './project-response.dto'

export class ProjectsPageResponseDto {
  @ApiProperty({ type: [ProjectDto] })
  data: ProjectDto[]

  @ApiProperty({ required: false, nullable: true })
  nextPage: number | null
}