import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GithubCallbackDto {
  @ApiProperty({
    description: "GitHub OAuth authorization code",
    example: "abc123xyz456",
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
