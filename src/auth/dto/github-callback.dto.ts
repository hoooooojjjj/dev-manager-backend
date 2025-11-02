import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum OAuthEnvironment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

export class GithubCallbackDto {
  @ApiProperty({
    description: "GitHub OAuth authorization code",
    example: "abc123xyz456",
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: "OAuth environment (development or production)",
    enum: OAuthEnvironment,
    example: OAuthEnvironment.DEVELOPMENT,
  })
  @IsEnum(OAuthEnvironment)
  @IsNotEmpty()
  environment: OAuthEnvironment;
}
