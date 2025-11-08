import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProjectStatus } from "../entities/project.entity";

export class ProjectResponseDto {
  @ApiProperty({
    description: "Project UUID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string;

  @ApiProperty({
    description: "User ID who created the project",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  userId: string;

  @ApiProperty({
    description: "Project title",
    example: "E-commerce Cart Feature",
  })
  title: string;

  @ApiProperty({
    description: "Notion PRD URL",
    example: "https://notion.so/page-id",
  })
  notionUrl: string;

  @ApiPropertyOptional({
    description: "GitHub repository URL",
    example: "https://github.com/user/repo",
  })
  repo: string | null;

  @ApiProperty({
    description: "List of focus files for analysis",
    example: ["src/cart/cart.service.ts", "src/cart/cart.controller.ts"],
    type: [String],
  })
  focusFiles: string[];

  @ApiPropertyOptional({
    description: "Published Notion document URL",
    example: "https://notion.so/published-page-id",
  })
  outputNotionUrl: string | null;

  @ApiProperty({
    description: "Project status",
    enum: ProjectStatus,
    example: ProjectStatus.INTAKE,
  })
  status: ProjectStatus;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2025-01-08T10:30:00.000Z",
  })
  createdAt: string;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2025-01-08T10:30:00.000Z",
  })
  updatedAt: string;
}
