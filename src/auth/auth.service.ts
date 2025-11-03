import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import axios from "axios";
import * as bcrypt from "bcrypt";

interface GithubTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

interface GithubUser {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
  name: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.jwtSecret = process.env.JWT_SECRET || "";
    if (!this.jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
  }

  /**
   * GitHub OAuth Callback 처리
   * Authorization Code -> Access Token -> User Info -> JWT 발급
   */
  async githubCallback(code: string, environment: string) {
    const accessToken = await this.exchangeCodeForToken(code, environment);

    const githubUser = await this.getGithubUser(accessToken);

    const user = await this.findOrCreateUser(githubUser);

    const tokens = await this.generateTokens(user);

    return {
      user: this.toUserDto(user),
      ...tokens,
    };
  }

  /**
   * GitHub Authorization Code를 Access Token으로 교환
   */
  private async exchangeCodeForToken(
    code: string,
    environment: string,
  ): Promise<string> {
    try {
      // 환경에 따라 credentials 변경
      const clientId =
        environment === "development"
          ? process.env.GITHUB_CLIENT_ID_DEV
          : process.env.GITHUB_CLIENT_ID_PROD;

      const clientSecret =
        environment === "development"
          ? process.env.GITHUB_CLIENT_SECRET_DEV
          : process.env.GITHUB_CLIENT_SECRET_PROD;

      if (!clientId || !clientSecret) {
        throw new UnauthorizedException(
          `GitHub OAuth credentials not configured for ${environment} environment`,
        );
      }

      const response = await axios.post<GithubTokenResponse>(
        "https://github.com/login/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
        },
        {
          headers: { Accept: "application/json" },
        },
      );

      if (!response.data.access_token) {
        throw new UnauthorizedException(
          "Failed to get access token from GitHub",
        );
      }

      return response.data.access_token;
    } catch (error) {
      console.error("GitHub token exchange error:", error);
      throw new UnauthorizedException(
        "Failed to exchange GitHub authorization code",
      );
    }
  }

  /**
   * GitHub Access Token으로 사용자 정보 조회
   */
  private async getGithubUser(accessToken: string): Promise<GithubUser> {
    try {
      const response = await axios.get<GithubUser>(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );

      // 이메일이 없는 경우 별도로 조회
      if (!response.data.email) {
        const emailResponse = await axios.get<GithubEmail[]>(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          },
        );

        const primaryEmail = emailResponse.data.find((email) => email.primary);
        response.data.email =
          primaryEmail?.email || `${response.data.login}@github.com`;
      }

      return response.data;
    } catch (error) {
      console.error("GitHub user fetch error:", error);
      throw new UnauthorizedException("Failed to get user info from GitHub");
    }
  }

  /**
   * 사용자 찾기 또는 생성
   */
  private async findOrCreateUser(githubUser: GithubUser): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { githubId: String(githubUser.id) },
    });

    if (!user) {
      // 신규 사용자 생성
      user = this.userRepository.create({
        email: githubUser.email,
        githubId: String(githubUser.id),
        userName: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        lastLoginAt: new Date(),
      });
    } else {
      // 기존 사용자 정보 업데이트
      user.email = githubUser.email;
      user.userName = githubUser.login;
      user.avatarUrl = githubUser.avatar_url;
      user.lastLoginAt = new Date();
    }

    return this.userRepository.save(user);
  }

  /**
   * JWT Access Token + Refresh Token 생성
   */
  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    // Access Token (15분)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN) || 15 * 60,
    });

    // Refresh Token (7일)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn:
        Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) || 7 * 24 * 60 * 60,
    });

    // Refresh Token 해시 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = hashedRefreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15분 (초 단위)
    };
  }

  /**
   * Refresh Token으로 새 Access Token 발급
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Refresh Token 검증
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtSecret,
      }) as { sub: number; email: string };

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // DB에 저장된 해시와 비교
      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // 새 Access Token 발급
      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: this.jwtSecret,
          expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN) || 15 * 60,
        },
      );

      return {
        accessToken: newAccessToken,
        expiresIn: 15 * 60,
      };
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  /**
   * 로그아웃 (Refresh Token 무효화)
   */
  async logout(userId: number) {
    await this.userRepository.update(userId, {
      refreshTokenHash: null,
    });
  }

  /**
   * 현재 사용자 조회
   */
  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return user;
  }

  /**
   * User Entity를 UserDto로 변환
   */
  private toUserDto(user: User) {
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
