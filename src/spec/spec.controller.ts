import { Controller, Get, Param } from "@nestjs/common";
import { SpecService } from "./spec.service";

/**
 * GitHub MCP 연결 테스트를 위한 컨트롤러
 */
@Controller("spec")
export class SpecController {
  constructor(private readonly specService: SpecService) {}

  /**
   * GitHub MCP 연결 상태 확인
   */
  @Get("test")
  async testConnection(): Promise<{ status: string; message: string }> {
    return this.specService.testConnection();
  }

  /**
   * GitHub 리포지토리 정보 가져오기
   * @param owner - 리포지토리 소유자
   * @param repo - 리포지토리 이름
   */
  @Get("github/repo/:owner/:repo")
  async getRepository(
    @Param("owner") owner: string,
    @Param("repo") repo: string,
  ): Promise<any> {
    return this.specService.getRepositoryInfo(owner, repo);
  }
}
