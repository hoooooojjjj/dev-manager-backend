import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty({ description: "사용자 ID", example: 1 })
  id: number;

  @ApiProperty({
    description: "이메일",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "GitHub 사용자명",
    example: "johndoe",
  })
  userName: string;

  @ApiProperty({
    description: "GitHub 프로필 이미지 URL",
    example: "https://avatars.githubusercontent.com/u/12345",
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: "GitHub 고유 ID",
    example: "12345678",
  })
  githubId: string;

  @ApiProperty({
    description: "계정 생성일",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "마지막 업데이트",
    example: "2024-01-01T00:00:00.000Z",
  })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "사용자 정보",
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: "JWT Access Token (15분 유효)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "JWT Refresh Token (7일 유효)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refreshToken: string;

  @ApiProperty({
    description: "Access Token 만료 시간 (초)",
    example: 900,
  })
  expiresIn: number;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: "새로운 Access Token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "Access Token 만료 시간 (초)",
    example: 900,
  })
  expiresIn: number;
}
