import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectResponseDto } from "./dto/project-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("projects")
@Controller("projects")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create new project",
    description: "Creates a new project and starts the intake pipeline",
  })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: "Project created successfully",
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async createProject(
    @Request() req: { user: { id: string } },
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.createProject(req.user.id, createProjectDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all projects",
    description: "Retrieves all projects for the authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "Projects retrieved successfully",
    type: [ProjectResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async findAllProjects(
    @Request() req: { user: { id: string } },
  ): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAllByUser(req.user.id);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get project by ID",
    description: "Retrieves a specific project by its ID",
  })
  @ApiParam({
    name: "id",
    description: "Project UUID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Project retrieved successfully",
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Project not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async findOne(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id, req.user.id);
  }
}
