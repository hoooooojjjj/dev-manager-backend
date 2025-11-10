# Dev Manager Backend

NestJS 기반 백엔드 서비스로 Anthropic AI SDK와 MySQL 데이터베이스를 사용합니다.

## 빠른 시작

### Prerequisites

- Docker Desktop
- Node.js 20+ (로컬 개발 시)

## 1. 환경 변수 설정

### .env 파일 생성

```bash
cp .env.example .env
```

### .env 파일을 열어서 실제 값 입력

- ANTHROPIC_API_KEY

- DB_HOST

- DB_PORT

- DB_USERNAME

- DB_PASSWORD

- DB_DATABASE

## 2. Docker로 개발 시작 (권장)

```bash
cd docker
```

### 실시간 로그와 함께 시작

```bash
make dev-logs
```

### 또는 백그라운드로 시작

```bash
make dev
```

```bash
make logs # 로그 보기
```

서버가 실행되면 http://localhost:3333 에서 접근 가능

## 3. 로컬 개발 (Docker 없이)

### MySQL이 로컬에 설치되어 있어야 함

#### .env의 DB_HOST=127.0.0.1로 설정

```bash
npm install
npm run start:dev
```

## 4. Docker 명령어

```bash
cd docker
```

### 개발 환경

```bash
make dev-logs # 실시간 로그와 함께 시작 (추천)
make dev # 백그라운드로 시작
make logs # 로그 보기
make down # 중지
```

### 기타 유용한 명령어

```bash
make help # 모든 명령어 보기
make rebuild-dev # 완전히 재빌드
make shell-app # 앱 컨테이너 셸 접속
make shell-db # MySQL 셸 접속
```

### MySQL Workbench 연결

```bash
Host: 127.0.0.1
Port: 3306
Username: root
Password: .env 파일의 DB_PASSWORD
Database: .env 파일의 DB_DATABASE
```

### DB 마이그레이션

**📚 자세한 마이그레이션 관리 가이드는 [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)를 참조하세요.**

기본 명령어:

```bash
# 1. 엔티티 변경 후 마이그레이션 자동 생성
npm run migration:generate src/migrations/YourMigrationName

# 2. 생성된 마이그레이션 확인
npm run migration:show

# 3. DB에 적용
npm run migration:run

# 4. 잘못됐으면 되돌리기
npm run migration:revert
```

## 5. 프로젝트 구조

```bash
├── src/              # 소스 코드
│   ├── entities/     # TypeORM 엔티티
│   ├── main.ts       # 애플리케이션 진입점
│   └── app.module.ts # 루트 모듈
├── docker/           # Docker 설정
│   ├── Makefile
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── docker-compose.*.yml
└── CLAUDE.md
```

## 6. Claude Code 프로젝트 가이드

### 기술 스택

```bash
Framework: NestJS
Database: MySQL 8.0 with TypeORM
AI: Anthropic AI SDK
Container: Docker & Docker Compose
```

### 개발 워크플로우

```bash
make dev-logs로 서버 시작
src/ 폴더에서 코드 수정 (자동 hot reload)
MySQL Workbench로 데이터베이스 확인
Ctrl+C로 로그 종료 (컨테이너는 계속 실행됨)
make down으로 완전히 중지
```

### 추가 정보

```bash
  자세한 개발 가이드는 CLAUDE.md를 참고하세요.
```
