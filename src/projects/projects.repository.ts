import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project, ProjectStatus } from "./entities/project.entity";

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
  ) {}

  /**
   * 프로젝트 생성
   */
  async createProject(projectData: {
    userId: string;
    title: string;
    notionUrl: string;
    repo: string;
    focusFiles: string[];
    outputNotionUrl: string;
    status: ProjectStatus;
  }): Promise<Project> {
    const project = this.repository.create(projectData);
    return this.repository.save(project);
  }

  /**
   * 사용자 ID로 모든 프로젝트 조회
   */
  async findAllByUserId(userId: string): Promise<Project[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * 프로젝트 ID와 사용자 ID로 단일 프로젝트 조회
   */
  async findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Project | null> {
    return this.repository.findOne({
      where: { id, userId },
    });
  }

  /**
   * 프로젝트 ID로 단일 프로젝트 조회
   */
  async findOneById(id: string): Promise<Project | null> {
    return this.repository.findOne({
      where: { id },
    });
  }
}
