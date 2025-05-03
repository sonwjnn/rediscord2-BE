import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common'
import { ProjectService } from './project.service'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger'
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectsPageResponseDto,
  ProjectDto,
} from './dto'
import { PaginationDto } from '@/utils/dto/pagination.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { DeleteProjectDto } from './dto/delete-project.dto'
@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'projects',
  version: '1',
})
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Get('templates')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', type: Number })
  @ApiQuery({ name: 'limit', type: Number })
  @ApiOkResponse({ type: ProjectsPageResponseDto })
  async getTemplates(@Query() { page, limit }: PaginationDto) {
    const data = await this.projectService.findTemplates(page, limit)
    return { data }
  }
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: DeleteProjectDto })
  deleteProject(
    @Param('id') id: string,
    @Request() req,
  ): Promise<NullableType<DeleteProjectDto>> {
    return this.projectService.delete(id, req.user.id)
  }
  @Post(':id/duplicate')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ProjectDto })
  duplicateProject(@Param('id') id: string, @Request() req) {
    return this.projectService.duplicate(id, req.user.id)
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', type: Number })
  @ApiQuery({ name: 'limit', type: Number })
  @ApiOkResponse({ type: ProjectsPageResponseDto })
  getUserProjects(@Query() { page, limit }: PaginationDto, @Request() req) {
    return this.projectService.getUserProjects(req.user.id, page, limit)
  }
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ProjectDto })
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectService.update(id, req.user.id, updateProjectDto)
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ProjectDto })
  getProject(
    @Param('id') id: string,
    @Request() req,
  ): Promise<NullableType<ProjectDto>> {
    return this.projectService.findOne(id, req.user.id)
  }
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProjectDto })
  createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req,
  ): Promise<NullableType<ProjectDto>> {
    return this.projectService.create({
      ...createProjectDto,
      userId: req.user.id,
    })
  }
}
