import {
  Controller,
  Post,
  Body,
  Get,
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
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { GithubCallbackDto } from "./dto/github-callback.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import {
  AuthResponseDto,
  RefreshResponseDto,
  UserDto,
} from "./dto/auth-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("github/callback")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "GitHub OAuth 콜백",
    description: "GitHub authorization code를 받아서 JWT 토큰을 발급합니다.",
  })
  @ApiBody({ type: GithubCallbackDto })
  @ApiResponse({
    status: 200,
    description: "로그인 성공",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "인증 실패",
  })
  async githubCallback(
    @Body() dto: GithubCallbackDto,
  ): Promise<AuthResponseDto> {
    return this.authService.githubCallback(dto.code, dto.environment);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Access Token 갱신",
    description: "Refresh Token을 사용하여 새로운 Access Token을 발급합니다.",
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: "토큰 갱신 성공",
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "유효하지 않은 Refresh Token",
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<RefreshResponseDto> {
    return this.authService.refreshAccessToken(dto.refreshToken);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "로그아웃",
    description: "Refresh Token을 무효화합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "로그아웃 성공",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Logged out successfully" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "인증되지 않음",
  })
  async logout(@Request() req: { user: { id: number } }) {
    await this.authService.logout(req.user.id);
    return { message: "Logged out successfully" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "현재 사용자 조회",
    description: "JWT 토큰으로 현재 로그인한 사용자 정보를 조회합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "사용자 정보 조회 성공",
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: "인증되지 않음",
  })
  async getCurrentUser(
    @Request() req: { user: { id: string } },
  ): Promise<UserDto> {
    const user = await this.authService.validateUser(req.user.id);
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      avatarUrl: user.avatarUrl,
      githubId: user.githubId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
