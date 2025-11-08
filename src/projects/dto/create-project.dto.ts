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
    description: "Notion PRD URLs",
    example: ["https://notion.so/page-id"],
    type: [String],
  })
  @IsArray()
  @IsUrl(undefined, { each: true })
  @IsNotEmpty({ each: true })
  notionUrls: string[];

  @ApiProperty({
    description: "GitHub repository URLs",
    example: ["https://github.com/user/repo"],
    type: [String],
  })
  @IsArray()
  @IsUrl(undefined, { each: true })
  @IsNotEmpty({ each: true })
  repos: string[];

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
