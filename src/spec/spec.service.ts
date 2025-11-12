import { Injectable } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import {
  Client,
  PageObjectResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client";
import {
  SimplifiedNotionContent,
  ContentBlock,
  BlockType,
  DatabaseRow,
} from "./simplified-notion-content.dto";

/**
 * Notion 블록 타입 정의 (계층 구조 포함)
 */
interface NotionBlock {
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  has_children: boolean;
  archived: boolean;
  [key: string]: any;
  children?: NotionBlock[];
}

/**
 * Notion 페이지 정보
 */
interface NotionPageInfo {
  id: string;
  title: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  cover?: string | null;
  icon?: string | null;
}

/**
 * Notion 페이지 전체 콘텐츠
 */
interface NotionPageContent {
  pageInfo: NotionPageInfo;
  blocks: NotionBlock[];
  metadata: {
    totalBlocks: number;
    maxDepth: number;
    fetchedAt: string;
  };
}

/**
 * GitHub MCP 연결 테스트를 위한 서비스
 */
@Injectable()
export class SpecService {
  private readonly client: Anthropic;
  private readonly notion: Client;
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultHeaders: {
        "anthropic-beta": "mcp-client-2025-04-04",
      },
    });

    // Notion 클라이언트 초기화
    this.notion = new Client({
      auth: process.env.NOTION_TOKEN,
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

  /**
   * 노션 정보 가져오기
   */
  async getNotionInfo(): Promise<any> {
    try {
      const pageId = "2022dc3ef514802fbe73e59938c17498";

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
            authorization_token: process.env.NOTION_TOKEN,
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
   * Notion 페이지 정보 가져오기 (직접 API 호출)
   * PRD/기획 문서에 최적화된 간소화된 형식으로 반환합니다.
   */
  async getNotionInfoByApi(): Promise<any> {
    try {
      const pageId = "2022dc3ef514802fbe73e59938c17498";

      console.log("Notion API 직접 호출 시작...");
      console.log("페이지 ID:", pageId);

      // 간소화된 콘텐츠 가져오기
      const simplifiedContent = await this.getSimplifiedNotionContent(pageId);

      console.log("Notion 페이지 조회 성공");
      console.log(`제목: ${simplifiedContent.title}`);
      console.log(`총 ${simplifiedContent.contents.length}개 블록 로드됨`);

      return {
        status: "success",
        data: simplifiedContent,
      };
    } catch (error: any) {
      console.error("Notion API 오류:", error);

      return {
        status: "error",
        message: error.message,
        code: error.code,
      };
    }
  }

  /**
   * 페이지네이션을 처리하여 모든 블록 가져오기
   * @param blockId 블록 ID (페이지 ID 또는 부모 블록 ID)
   * @returns 모든 블록 배열
   */
  private async fetchAllBlocksWithPagination(
    blockId: string,
  ): Promise<Array<BlockObjectResponse | PartialBlockObjectResponse>> {
    const allBlocks: Array<BlockObjectResponse | PartialBlockObjectResponse> =
      [];
    let cursor: string | undefined = undefined;
    let pageCount = 0;

    do {
      pageCount++;
      const response = await this.notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
        page_size: 100, // 최대값
      });

      allBlocks.push(...response.results);
      console.log(
        `페이지네이션 ${pageCount}: ${response.results.length}개 블록 가져옴 (has_more: ${response.has_more})`,
      );

      cursor = response.next_cursor || undefined;
    } while (cursor);

    console.log(
      `총 ${allBlocks.length}개 블록 가져오기 완료 (${pageCount}페이지)`,
    );
    return allBlocks;
  }

  /**
   * 재귀적으로 블록과 자식 블록들을 가져오기
   * @param block 블록 객체
   * @param currentDepth 현재 깊이
   * @param maxDepth 최대 깊이
   * @returns 자식 블록이 포함된 NotionBlock
   */
  private async fetchBlockWithChildren(
    block: BlockObjectResponse | PartialBlockObjectResponse,
    currentDepth: number,
    maxDepth: number,
  ): Promise<NotionBlock> {
    // PartialBlockObjectResponse 체크
    if (!("type" in block)) {
      return {
        id: block.id,
        type: "unknown",
        created_time: "",
        last_edited_time: "",
        has_children: false,
        archived: false,
        children: [],
      };
    }

    // 기본 블록 정보
    const notionBlock: NotionBlock = {
      id: block.id,
      type: block.type,
      created_time: block.created_time,
      last_edited_time: block.last_edited_time,
      has_children: block.has_children,
      archived: block.archived,
      [block.type]: (block as any)[block.type], // 블록 타입별 콘텐츠
      children: [],
    };

    // has_children이 true이고 최대 깊이를 넘지 않았을 때만 재귀 호출
    if (block.has_children && currentDepth < maxDepth) {
      try {
        console.log(
          `깊이 ${currentDepth}: 블록 ${block.type}의 자식 블록 가져오는 중...`,
        );
        const childBlocks = await this.fetchAllBlocksWithPagination(block.id);

        // 각 자식 블록에 대해 재귀적으로 처리 (병렬 처리)
        notionBlock.children = await Promise.all(
          childBlocks.map((child) =>
            this.fetchBlockWithChildren(child, currentDepth + 1, maxDepth),
          ),
        );
        console.log(
          `깊이 ${currentDepth}: ${notionBlock.children.length}개 자식 블록 처리 완료`,
        );
      } catch (error) {
        console.error(
          `블록 ${block.id}의 자식 블록 가져오기 실패:`,
          error.message,
        );
        // 에러 발생 시 빈 배열로 처리
        notionBlock.children = [];
      }
    } else if (block.has_children && currentDepth >= maxDepth) {
      console.warn(
        `최대 깊이 ${maxDepth} 도달: 블록 ${block.type}의 자식 블록 생략`,
      );
    }

    return notionBlock;
  }

  /**
   * 블록에서 텍스트 추출
   * @param block 블록 객체
   * @returns 추출된 텍스트
   */
  private extractTextFromBlock(block: any): string {
    const blockType = block.type;
    const content = block[blockType];

    if (!content) {
      return "";
    }

    // rich_text 배열이 있는 블록 타입들 (paragraph, heading, toggle, callout 등)
    if (content.rich_text && Array.isArray(content.rich_text)) {
      return content.rich_text.map((rt: any) => rt.plain_text).join("");
    }

    // title 배열 (child_page, child_database 등)
    if (content.title && Array.isArray(content.title)) {
      return content.title.map((t: any) => t.plain_text).join("");
    }

    return "";
  }

  /**
   * Notion 페이지의 전체 콘텐츠 가져오기 (모든 중첩 블록 포함)
   * @param pageId 페이지 ID
   * @param maxDepth 최대 재귀 깊이 (기본값: 15)
   * @returns 전체 페이지 콘텐츠
   */
  async getFullNotionPageContent(
    pageId: string,
    maxDepth: number = 15,
  ): Promise<NotionPageContent> {
    // 1. 페이지 정보 가져오기
    const page = await this.notion.pages.retrieve({
      page_id: pageId,
    });

    // 2. PartialPageObjectResponse 체크
    if (!("properties" in page)) {
      throw new Error("페이지 정보를 가져올 수 없습니다 (Partial response)");
    }

    // 3. PageObjectResponse로 타입 단언
    const fullPage = page as PageObjectResponse;

    // 4. 페이지 제목 추출
    let title = "제목 없음";
    for (const key in fullPage.properties) {
      const prop = fullPage.properties[key];
      if (prop.type === "title" && "title" in prop && prop.title?.length > 0) {
        title = prop.title[0].plain_text;
        break;
      }
    }

    // 5. 페이지 정보 구성
    const pageInfo: NotionPageInfo = {
      id: fullPage.id,
      title: title,
      url: fullPage.url,
      created_time: fullPage.created_time,
      last_edited_time: fullPage.last_edited_time,
      cover:
        fullPage.cover?.type === "external"
          ? fullPage.cover.external.url
          : fullPage.cover?.type === "file"
            ? fullPage.cover.file.url
            : null,
      icon:
        fullPage.icon?.type === "emoji"
          ? fullPage.icon.emoji
          : fullPage.icon?.type === "external"
            ? fullPage.icon.external.url
            : fullPage.icon?.type === "file"
              ? fullPage.icon.file.url
              : null,
    };

    // 6. 모든 최상위 블록 가져오기 (페이지네이션 처리)
    const topLevelBlocks = await this.fetchAllBlocksWithPagination(pageId);

    // 7. 각 블록에 대해 재귀적으로 자식 블록 가져오기
    const blocks = await Promise.all(
      topLevelBlocks.map((block) =>
        this.fetchBlockWithChildren(block, 0, maxDepth),
      ),
    );

    // 8. 메타데이터 계산
    const calculateTotalBlocks = (blockArray: NotionBlock[]): number => {
      return blockArray.reduce((total, block) => {
        return (
          total +
          1 +
          (block.children ? calculateTotalBlocks(block.children) : 0)
        );
      }, 0);
    };

    const calculateMaxDepth = (
      blockArray: NotionBlock[],
      currentDepth: number = 0,
    ): number => {
      if (blockArray.length === 0) {
        return currentDepth;
      }
      return Math.max(
        ...blockArray.map((block) =>
          block.children && block.children.length > 0
            ? calculateMaxDepth(block.children, currentDepth + 1)
            : currentDepth,
        ),
      );
    };

    return {
      pageInfo,
      blocks,
      metadata: {
        totalBlocks: calculateTotalBlocks(blocks),
        maxDepth: calculateMaxDepth(blocks),
        fetchedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 간소화된 Notion 콘텐츠 가져오기 (PRD/기획 문서 최적화)
   * @param pageId 페이지 ID
   * @returns 간소화된 콘텐츠
   */
  async getSimplifiedNotionContent(
    pageId: string,
  ): Promise<SimplifiedNotionContent> {
    // 1. 전체 콘텐츠 가져오기 (깊이 제한 99 = 사실상 제한 없음)
    const fullContent = await this.getFullNotionPageContent(pageId, 99);

    // 2. 간소화된 형식으로 변환 (비동기 - 데이터베이스 처리)
    return {
      title: fullContent.pageInfo.title,
      url: fullContent.pageInfo.url,
      lastEditedTime: fullContent.pageInfo.last_edited_time,
      contents: await this.convertBlocksToSimplifiedAsync(
        fullContent.blocks,
        0,
      ),
    };
  }

  /**
   * NotionBlock 배열을 ContentBlock 배열로 변환 (비동기 - 데이터베이스 처리)
   * @param blocks 원본 블록 배열
   * @param indentLevel 들여쓰기 레벨
   * @returns 간소화된 블록 배열
   */
  private async convertBlocksToSimplifiedAsync(
    blocks: NotionBlock[],
    indentLevel: number,
  ): Promise<ContentBlock[]> {
    const result: ContentBlock[] = [];

    for (const block of blocks) {
      const contentBlock = await this.convertSingleBlockAsync(
        block,
        indentLevel,
      );
      if (contentBlock) {
        result.push(contentBlock);
      }

      // 리스트 항목의 자식은 들여쓰기를 증가시켜 처리
      // (토글은 convertSingleBlockAsync에서 children 필드로 처리됨)
      if (
        block.children &&
        block.children.length > 0 &&
        block.type !== "toggle" &&
        block.type !== "child_database"
      ) {
        const childBlocks = await this.convertBlocksToSimplifiedAsync(
          block.children,
          indentLevel + 1,
        );
        result.push(...childBlocks);
      }
    }

    return result;
  }

  /**
   * 단일 NotionBlock을 ContentBlock으로 변환
   * @param block 원본 블록
   * @param indentLevel 들여쓰기 레벨
   * @returns 간소화된 블록 (null이면 스킵)
   */
  private convertSingleBlock(
    block: NotionBlock,
    indentLevel: number,
  ): ContentBlock | null {
    const type = block.type as BlockType;

    // divider는 특별 처리
    if (type === "divider") {
      return {
        type: "divider",
        content: "---",
        indentLevel,
      };
    }

    // 텍스트 콘텐츠 추출
    const content = this.extractTextFromBlock(block);

    // 빈 콘텐츠는 제외 (테이블, 이미지, child_database는 예외)
    if (
      !content &&
      type !== "table" &&
      type !== "image" &&
      type !== "child_database"
    ) {
      return null;
    }

    // 기본 블록 정보
    const baseBlock: ContentBlock = {
      type,
      content,
      indentLevel,
    };

    // 타입별 추가 정보 설정
    switch (type) {
      case "heading_1":
        baseBlock.level = 1;
        break;

      case "heading_2":
        baseBlock.level = 2;
        break;

      case "heading_3":
        baseBlock.level = 3;
        break;

      case "to_do":
        baseBlock.checked = block.to_do?.checked || false;
        break;

      case "code":
        baseBlock.language = block.code?.language || "plaintext";
        break;

      case "image":
        baseBlock.url = this.extractImageUrl(block);
        baseBlock.content = baseBlock.url || "";
        break;

      case "table":
        baseBlock.tableData = this.extractTableData(block);
        baseBlock.content = `Table (${baseBlock.tableData?.length || 0} rows)`;
        break;

      case "child_database":
        // 데이터베이스 콘텐츠를 비동기로 가져와야 하므로 별도 처리 필요
        // 일단 데이터베이스 제목만 표시
        baseBlock.content = content || "Database";
        baseBlock.url = `https://notion.so/${block.id.replace(/-/g, "")}`;
        // 실제 데이터베이스 콘텐츠는 convertSingleBlockAsync에서 처리
        break;

      case "toggle":
        // 토글의 자식 블록은 convertSingleBlockAsync에서 비동기로 처리
        break;
    }

    return baseBlock;
  }

  /**
   * 단일 NotionBlock을 ContentBlock으로 변환 (비동기 - 데이터베이스 처리)
   * @param block 원본 블록
   * @param indentLevel 들여쓰기 레벨
   * @returns 간소화된 블록 (null이면 스킵)
   */
  private async convertSingleBlockAsync(
    block: NotionBlock,
    indentLevel: number,
  ): Promise<ContentBlock | null> {
    // 기본 변환 먼저 수행
    const baseBlock = this.convertSingleBlock(block, indentLevel);
    if (!baseBlock) {
      return null;
    }

    // toggle의 children 처리 (비동기)
    if (
      block.type === "toggle" &&
      block.children &&
      block.children.length > 0
    ) {
      baseBlock.children = await this.convertBlocksToSimplifiedAsync(
        block.children,
        indentLevel + 1,
      );
    }

    // child_database인 경우 데이터베이스 콘텐츠 가져오기
    if (block.type === "child_database") {
      try {
        console.log(`child_database ${block.id} 콘텐츠 가져오는 중...`);
        const databaseRows = await this.fetchDatabaseContent(block.id);
        baseBlock.databaseRows = databaseRows;
        baseBlock.content = `Database: ${baseBlock.content} (${databaseRows.length} rows)`;
      } catch (error) {
        console.error(`데이터베이스 ${block.id} 가져오기 실패:`, error.message);
        baseBlock.content = `Database: ${baseBlock.content} (로드 실패)`;
      }
    }

    return baseBlock;
  }

  /**
   * 테이블 데이터를 2차원 배열로 추출
   * @param block 테이블 블록
   * @returns 2차원 문자열 배열
   */
  private extractTableData(block: NotionBlock): string[][] {
    const rows: string[][] = [];

    if (block.children) {
      for (const row of block.children) {
        if (row.type === "table_row" && row.table_row?.cells) {
          const cells = row.table_row.cells.map((cell: any[]) =>
            cell.map((text: any) => text.plain_text || "").join(""),
          );
          rows.push(cells);
        }
      }
    }

    return rows;
  }

  /**
   * 이미지 URL 추출
   * @param block 이미지 블록
   * @returns 이미지 URL
   */
  private extractImageUrl(block: NotionBlock): string | undefined {
    if (block.image?.type === "external") {
      return block.image.external.url;
    } else if (block.image?.type === "file") {
      return block.image.file.url;
    }
    return undefined;
  }

  /**
   * 지연 함수 (재시도 메커니즘용)
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 데이터베이스 콘텐츠 가져오기 (재시도 포함)
   * @param databaseId 데이터베이스 ID
   * @param maxRetries 최대 재시도 횟수 (기본값: 3)
   * @returns 데이터베이스 행 배열
   */
  private async fetchDatabaseContent(
    databaseId: string,
    maxRetries: number = 3,
  ): Promise<DatabaseRow[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetchDatabaseContentOnce(databaseId);
      } catch (error: any) {
        console.error(
          `[DB Retry] 시도 ${attempt}/${maxRetries} 실패: ${error.message}`,
        );

        // 마지막 시도였다면 에러 throw
        if (attempt === maxRetries) {
          console.error(
            `[DB Retry] 최대 재시도 횟수 ${maxRetries}회 도달. 포기합니다.`,
          );
          throw error;
        }

        // Rate limit 또는 일시적 오류인 경우만 재시도
        const shouldRetry =
          error.code === "rate_limited" ||
          error.code === "service_unavailable" ||
          error.status === 429 ||
          error.status === 503;

        if (!shouldRetry) {
          console.error(
            `[DB Retry] 재시도 불가능한 에러 (${error.code}). 즉시 실패 처리.`,
          );
          throw error;
        }

        // Exponential backoff (1초, 2초, 4초...)
        const delayMs = 1000 * Math.pow(2, attempt - 1);
        console.log(`[DB Retry] ${delayMs}ms 후 재시도...`);
        await this.delay(delayMs);
      }
    }

    throw new Error("예상치 못한 에러");
  }

  /**
   * 데이터베이스 콘텐츠 가져오기 (단일 시도)
   * @param databaseId 데이터베이스 ID
   * @returns 데이터베이스 행 배열
   */
  private async fetchDatabaseContentOnce(
    databaseId: string,
  ): Promise<DatabaseRow[]> {
    const rows: DatabaseRow[] = [];
    let cursor: string | undefined = undefined;
    let pageCount = 0;

    console.log(`[DB Query] 데이터베이스 ${databaseId} 쿼리 시작...`);

    try {
      do {
        pageCount++;
        console.log(
          `[DB Query] 페이지 ${pageCount} 요청 중... (cursor: ${cursor || "없음"})`,
        );

        // @ts-ignore - Notion SDK의 타입 정의 문제로 인한 임시 처리
        const response = await this.notion.databases.query({
          database_id: databaseId,
          start_cursor: cursor,
          page_size: 100,
        });

        console.log(
          `[DB Query] 페이지 ${pageCount} 성공: ${response.results.length}개 항목, has_more: ${response.has_more}`,
        );

        // 각 결과(페이지)를 DatabaseRow로 변환
        for (const page of response.results) {
          if ("properties" in page) {
            const row = this.convertPageToDatabaseRow(page);
            if (row) {
              rows.push(row);
            }
          }
        }

        cursor = response.next_cursor || undefined;
      } while (cursor);

      console.log(`[DB Query] ✓ 성공: 총 ${rows.length}개 항목 로드 완료`);
      return rows;
    } catch (error: any) {
      console.error(`[DB Query] ✗ 실패: 데이터베이스 ${databaseId}`, {
        errorCode: error.code,
        errorStatus: error.status,
        errorMessage: error.message,
        errorBody: error.body,
        responseData: error.response?.data,
        timestamp: new Date().toISOString(),
      });

      // 상세 에러 정보 출력
      if (error.code === "object_not_found") {
        console.error(
          `[DB Query] → 데이터베이스를 찾을 수 없습니다. Integration이 이 데이터베이스에 접근 권한이 있는지 확인하세요.`,
        );
      } else if (error.code === "unauthorized") {
        console.error(
          `[DB Query] → 인증 실패. Notion Integration 토큰이 유효한지 확인하세요.`,
        );
      } else if (error.code === "restricted_resource") {
        console.error(
          `[DB Query] → 접근 제한된 리소스. Integration에 데이터베이스 접근 권한을 부여하세요.`,
        );
      }

      throw error;
    }
  }

  /**
   * Notion 페이지를 DatabaseRow로 변환
   * @param page Notion 페이지 객체
   * @returns DatabaseRow 또는 null
   */
  private convertPageToDatabaseRow(page: any): DatabaseRow | null {
    try {
      // 제목 추출
      let title = "제목 없음";
      for (const key in page.properties) {
        const prop = page.properties[key];
        if (prop.type === "title" && prop.title?.length > 0) {
          title = prop.title[0].plain_text;
          break;
        }
      }

      // 모든 속성 추출
      const properties: Record<string, string> = {};
      for (const key in page.properties) {
        const prop = page.properties[key];
        properties[key] = this.extractPropertyValue(prop);
      }

      return {
        id: page.id,
        title,
        url: page.url,
        properties,
      };
    } catch (error) {
      console.error("페이지 변환 실패:", error.message);
      return null;
    }
  }

  /**
   * Notion 속성 값 추출
   * @param property Notion 속성 객체
   * @returns 문자열 값
   */
  private extractPropertyValue(property: any): string {
    try {
      switch (property.type) {
        case "title":
          return (
            property.title
              ?.map((t: any) => t.plain_text)
              .join("")
              .trim() || ""
          );

        case "rich_text":
          return (
            property.rich_text
              ?.map((t: any) => t.plain_text)
              .join("")
              .trim() || ""
          );

        case "number":
          return property.number?.toString() || "";

        case "select":
          return property.select?.name || "";

        case "multi_select":
          return (
            property.multi_select?.map((s: any) => s.name).join(", ") || ""
          );

        case "date":
          if (property.date?.start) {
            const end = property.date.end ? ` ~ ${property.date.end}` : "";
            return `${property.date.start}${end}`;
          }
          return "";

        case "checkbox":
          return property.checkbox ? "✓" : "";

        case "url":
          return property.url || "";

        case "email":
          return property.email || "";

        case "phone_number":
          return property.phone_number || "";

        case "status":
          return property.status?.name || "";

        case "people":
          return (
            property.people?.map((p: any) => p.name || p.id).join(", ") || ""
          );

        case "files":
          return (
            property.files
              ?.map((f: any) => f.name || f.file?.url || f.external?.url)
              .join(", ") || ""
          );

        case "relation":
          return `${property.relation?.length || 0}개 관계`;

        case "formula":
          return this.extractFormulaValue(property.formula);

        case "rollup":
          return this.extractRollupValue(property.rollup);

        default:
          return "";
      }
    } catch (error) {
      console.error(`속성 추출 실패 (${property.type}):`, error.message);
      return "";
    }
  }

  /**
   * Formula 속성 값 추출
   */
  private extractFormulaValue(formula: any): string {
    if (!formula) return "";

    switch (formula.type) {
      case "string":
        return formula.string || "";
      case "number":
        return formula.number?.toString() || "";
      case "boolean":
        return formula.boolean ? "true" : "false";
      case "date":
        return formula.date?.start || "";
      default:
        return "";
    }
  }

  /**
   * Rollup 속성 값 추출
   */
  private extractRollupValue(rollup: any): string {
    if (!rollup) return "";

    switch (rollup.type) {
      case "number":
        return rollup.number?.toString() || "";
      case "date":
        return rollup.date?.start || "";
      case "array":
        return `${rollup.array?.length || 0}개 항목`;
      default:
        return "";
    }
  }
}
