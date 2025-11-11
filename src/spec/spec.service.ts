import { Injectable } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";

/**
 * GitHub MCP 연결 테스트를 위한 서비스
 */
@Injectable()
export class SpecService {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultHeaders: {
        "anthropic-beta": "mcp-client-2025-04-04",
      },
    });
  }

  /**
   * MCP 연결 상태 확인
   */
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: 'Hello! Please respond with "MCP connection successful"',
          },
        ],
      });

      return {
        status: "success",
        message:
          response.content[0].type === "text"
            ? response.content[0].text
            : "Connection established",
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Connection failed",
      };
    }
  }

  /**
   * GitHub 리포지토리 정보 가져오기
   */
  async getRepositoryInfo(owner: string, repo: string): Promise<any> {
    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 2048,
        mcp_servers: [
          {
            type: "url",
            url: process.env.GITHUB_MCP_SERVER_URL,
            name: process.env.GITHUB_MCP_SERVER_NAME,
            authorization_token: process.env.GITHUB_PAT,
          },
        ],
        messages: [
          {
            role: "user",
            content: `Please use the GitHub MCP to get information about the repository ${owner}/${repo}. Return the repository name, description, stars, and language.`,
          },
        ],
      } as any);

      return {
        status: "success",
        data: response.content,
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to fetch repository info",
      };
    }
  }
}
