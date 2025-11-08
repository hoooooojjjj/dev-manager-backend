import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsArray,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProjectDto {
  @ApiProperty({
    description: "Project title",
    example: "E-commerce Cart Feature",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Notion PRD URL",
    example: "https://notion.so/page-id",
  })
  @IsUrl()
  @IsNotEmpty()
  notionUrl: string;

  @ApiProperty({
    description: "GitHub repository URL",
    example: "https://github.com/user/repo",
  })
  @IsUrl()
  @IsNotEmpty()
  repo: string;

  @ApiPropertyOptional({
    description: "List of focus files for analysis",
    example: ["src/cart/cart.service.ts", "src/cart/cart.controller.ts"],
    type: [String],
    default: [],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  focusFiles?: string[];

  @ApiProperty({
    description: "Published Notion document URL",
    example: "https://notion.so/published-page-id",
  })
  @IsUrl()
  @IsNotEmpty()
  outputNotionUrl: string;
}
