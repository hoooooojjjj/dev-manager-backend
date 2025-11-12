import { Injectable } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
/**
 * Notion 블록 타입 정의 (계층 구조 포함)
 *
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
            content: `Please use the GitHub MCP to get information about the repository ${owner}/${repo}. Return the repository name.`,
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

  /**
   * 노션 정보 가져오기
   */
  async getNotionInfo(): Promise<any> {
    try {
      const pageId = "2a950016a40e80b5a340e0d56bf66d06";

      console.log("Notion MCP 호출 시작...");
      console.log("페이지 ID:", pageId);

      const response = await this.client.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 2048,
        mcp_servers: [
          {
            type: "url",
            url: "https://mcp.notion.com/mcp",
            name: "notion-mcp",
            authorization_token: `${process.env.NOTION_TOKEN}`,
          },
        ],
        messages: [
          {
            role: "user",
            content: `Use the Notion MCP to retrieve page ${pageId}. Return the page title and any available content.`,
          },
        ],
      } as any);

      console.log("응답 수신:", JSON.stringify(response, null, 2));

      return {
        status: "success",
        data: response.content,
        fullResponse: response, // 전체 응답 확인용
      };
    } catch (error) {
      console.error("Notion MCP 오류:", error);

      return {
        status: "error",
        message: error.message,
        errorType: error.constructor.name,
        details: error.response?.data,
        stack: error.stack,
      };
    }
  }

  /**
   * Brave 검색 결과 가져오기
   */
  async getExaSearchResult(): Promise<any> {
    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 2048,
        mcp_servers: [
          {
            type: "url",
            url: "https://mcp.exa.ai/mcp",
            name: "exa-mcp",
          },
        ],
        messages: [
          {
            role: "user",
            content: `나는 프론트엔드 메인 풀스택 개발자입니다. exa MCP를 사용하여 2025년 11월 기준 대한민국 주요 스타트업 개발자/풀스택/AIagent 채용 공고를 3개만 검색하세요. 검색 결과를 반환하세요.
            응답은 기업명, 공고 URL만 아주 짧게 반환하세요.`,
          },
        ],
      } as any);

      return {
        status: "success",
        data: response.content,
        fullResponse: response, // 전체 응답 확인용
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        errorType: error.constructor.name,
        details: error.response?.data,
        stack: error.stack,
      };
    }
  }
}
