import { Injectable, NotFoundException } from "@nestjs/common";
import { ProjectStatus } from "./entities/project.entity";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectResponseDto } from "./dto/project-response.dto";
import { ProjectsRepository } from "./projects.repository";
import { Project } from "./entities/project.entity";

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  /**
   * 새 프로젝트 생성
   */
  async createProject(
    userId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const projectData = {
      userId,
      title: createProjectDto.title,
      notionUrl: createProjectDto.notionUrl,
      repo: createProjectDto.repo,
      focusFiles: createProjectDto.focusFiles || [],
      status: ProjectStatus.INTAKE,
    };
    const savedProject =
      await this.projectsRepository.createProject(projectData);
    return this.toProjectResponseDto(savedProject);
  }

  /**
   * 사용자의 프로젝트 목록 조회
   */
  async findAllByUser(userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsRepository.findAllByUserId(userId);
    return projects.map((project) => this.toProjectResponseDto(project));
  }

  /**
   * 프로젝트 ID로 조회
   */
  async findOne(id: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOneByIdAndUserId(
      id,
      userId,
    );

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return this.toProjectResponseDto(project);
  }

  /**
   * Entity를 ResponseDto로 변환
   */
  private toProjectResponseDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      userId: project.userId,
      title: project.title,
      notionUrl: project.notionUrl,
      repo: project.repo,
      focusFiles: project.focusFiles,
      outputNotionUrl: project.outputNotionUrl,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
