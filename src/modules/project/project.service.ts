import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { Project } from '@prisma/client'
import {
  CreateProjectDto,
  ProjectDto,
  ProjectsPageResponseDto,
  UpdateProjectDto,
} from './dto'
import { NullableType } from '@/utils/types/nullable.type'
import { ApiNotFoundException } from '@/utils/exception'
import { ConfigService } from '@nestjs/config'
import { getS3ImageUrl } from '@/utils/get-s3-image-url'
@Injectable()
export class ProjectService {
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getUserProjects(
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProjectsPageResponseDto> {
    const data = await this.findProjectsByUserId(userId, page, limit)
    return { data, nextPage: data.length === limit ? page + 1 : null }
  }

  async findTemplates(
    page: number,
    limit: number,
  ): Promise<NullableType<ProjectDto[]>> {
    const projects = await this.db.project.findMany({
      where: { isTemplate: true },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: [{ isPro: 'asc' }, { updatedAt: 'desc' }],
      include: {
        projectFiles: {
          where: { fileType: 'THUMBNAIL' },
        },
      },
    })

    const formattedData = projects.map(project => {
      const thumbnail = project.projectFiles[0]
      return {
        ...project,
        thumbnailUrl: getS3ImageUrl(
          thumbnail?.path,
          this.configService.get('file.awsDefaultS3Bucket'),
        ),
      }
    })

    return formattedData
  }

  async findProjectsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProjectDto[]> {
    const projects = await this.db.project.findMany({
      where: { userId },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: [{ isPro: 'asc' }, { updatedAt: 'desc' }],
      include: {
        projectFiles: {
          where: { fileType: 'THUMBNAIL' },
        },
      },
    })

    const formattedData = projects.map(project => {
      return {
        ...project,
        thumbnailUrl: getS3ImageUrl(
          project.projectFiles[0]?.path,
          this.configService.get('file.awsDefaultS3Bucket'),
        ),
      }
    })

    return formattedData
  }
  async findOne(id: string, userId: string): Promise<NullableType<ProjectDto>> {
    const project = await this.db.project.findFirst({
      where: { id, userId },
      include: {
        projectFiles: {
          where: { fileType: 'THUMBNAIL' },
        },
      },
    })

    if (!project) {
      throw new ApiNotFoundException('projectNotFound')
    }

    const formattedData = {
      ...project,
      thumbnailUrl: getS3ImageUrl(
        project.projectFiles[0]?.path,
        this.configService.get('file.awsDefaultS3Bucket'),
      ),
    }

    return formattedData
  }
  create(
    data: CreateProjectDto & { userId: string },
  ): Promise<NullableType<ProjectDto>> {
    return this.db.project.create({
      data: { ...data, createdAt: new Date(), updatedAt: new Date() },
    })
  }
  update(
    id: string,
    userId: string,
    data: UpdateProjectDto,
  ): Promise<NullableType<ProjectDto>> {
    return this.db.project.update({
      where: { id, userId },
      data: { ...data, updatedAt: new Date() },
    })
  }
  delete(id: string, userId: string): Promise<NullableType<{ id: string }>> {
    return this.db.project.delete({
      where: {
        id,
        userId,
      },
    })
  }
  async duplicate(
    id: string,
    userId: string,
  ): Promise<NullableType<ProjectDto>> {
    const project = await this.findOne(id, userId)

    if (!project) {
      throw new ApiNotFoundException('projectNotFound')
    }

    return this.create({
      name: `Copy of ${project.name}`,
      json: project.json,
      width: project.width,
      height: project.height,
      userId: userId,
    })
  }
}
