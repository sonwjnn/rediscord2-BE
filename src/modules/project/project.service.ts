import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { Project } from '@prisma/client'
import {
  CreateProjectDto,
  ProjectsPageResponseDto,
  UpdateProjectDto,
} from './dto'
import { NullableType } from '@/utils/types/nullable.type'
import { ApiNotFoundException } from '@/utils/exception'
@Injectable()
export class ProjectService {
  constructor(private readonly db: PrismaService) {}

  async getUserProjects(
    userId: string,
    page: number,
    limit: number,
  ): Promise<ProjectsPageResponseDto> {
    const data = await this.findProjectsByUserId(userId, page, limit)
    return { data, nextPage: data.length === limit ? page + 1 : null }
  }

  findTemplates(page: number, limit: number): Promise<NullableType<Project[]>> {
    return this.db.project.findMany({
      where: { isTemplate: true },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: [{ isPro: 'asc' }, { updatedAt: 'desc' }],
    })
  }

  findProjectsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Project[]> {
    return this.db.project.findMany({
      where: { userId },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }
  findOne(id: string, userId: string): Promise<Project | null> {
    return this.db.project.findFirst({
      where: {
        id,
        userId,
      },
    })
  }
  create(data: CreateProjectDto & { userId: string }): Promise<Project> {
    return this.db.project.create({
      data: { ...data, createdAt: new Date(), updatedAt: new Date() },
    })
  }
  async update(
    id: string,
    userId: string,
    data: UpdateProjectDto,
  ): Promise<NullableType<Project>> {
    const updated = await this.db.project.update({
      where: { id, userId },
      data: { ...data, updatedAt: new Date() },
    })

    if (!updated) {
      throw new ApiNotFoundException('projectNotFound')
    }

    return updated
  }
  delete(id: string, userId: string): Promise<NullableType<{ id: string }>> {
    return this.db.project.delete({
      where: {
        id,
        userId,
      },
    })
  }
  async duplicate(id: string, userId: string): Promise<NullableType<Project>> {
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
