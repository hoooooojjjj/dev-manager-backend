/**
 * 간소화된 Notion 콘텐츠 타입 정의
 * PRD/기획 문서에 최적화된 데이터 구조
 */

/**
 * 지원하는 블록 타입
 */
export type BlockType =
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "paragraph"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "to_do"
  | "callout"
  | "quote"
  | "code"
  | "table"
  | "image"
  | "toggle"
  | "divider"
  | "child_database";

/**
 * 간소화된 콘텐츠 블록
 * 텍스트 콘텐츠와 필수 메타데이터만 포함
 */
export interface ContentBlock {
  /** 블록 타입 */
  type: BlockType;

  /** 텍스트 콘텐츠 (plain text) */
  content: string;

  /** heading의 경우 레벨 (1-3) */
  level?: number;

  /** to_do의 경우 체크 여부 */
  checked?: boolean;

  /** 들여쓰기 레벨 (0부터 시작, 리스트 중첩에 사용) */
  indentLevel?: number;

  /** code 블록의 경우 언어 */
  language?: string;

  /** image의 경우 URL */
  url?: string;

  /** table의 경우 2차원 배열 데이터 */
  tableData?: string[][];

  /** child_database의 경우 데이터베이스 항목들 */
  databaseRows?: DatabaseRow[];

  /** toggle 블록의 경우 자식 블록들 */
  children?: ContentBlock[];
}

/**
 * 데이터베이스 행 (페이지) 정보
 */
export interface DatabaseRow {
  /** 페이지 ID */
  id: string;

  /** 페이지 제목 */
  title: string;

  /** 페이지 URL */
  url: string;

  /** 속성 값들 (키-값 쌍) */
  properties: Record<string, string>;
}

/**
 * 간소화된 Notion 페이지 콘텐츠
 */
export interface SimplifiedNotionContent {
  /** 페이지 제목 */
  title: string;

  /** 페이지 URL */
  url: string;

  /** 마지막 수정 시간 (문서 버전 추적용) */
  lastEditedTime: string;

  /** 콘텐츠 블록 배열 */
  contents: ContentBlock[];
}
