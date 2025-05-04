import { ApiProperty } from '@nestjs/swagger'
import { ProjectDto } from '../domain/project.dto'

export class ProjectsPageResponseDto {
  @ApiProperty({ type: [ProjectDto] })
  data: ProjectDto[]

  @ApiProperty({ required: false, nullable: true })
  nextPage: number | null
}
