# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You should think in English but speak in Korean.

## Project Overview

This is a NestJS backend service (dev-manager-backend) that integrates with the Anthropic AI SDK. The application runs on port 3333 by default and has CORS configured for a Vercel frontend deployment and local development.

## Commands

### Development

- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled
- `npm start` - Start without watch mode

### Building

- `npm run build` - Build the project (outputs to dist/)

### Testing

- `npm test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Run tests with Node debugger

### Code Quality

- `npm run lint` - Lint and auto-fix TypeScript files
- `npm run format` - Format code with Prettier

### Production

- `npm run start:prod` - Run production build (requires `npm run build` first)

### Docker

**Prerequisites**:
- Create `.env` file in the project root (copy from `.env.example` and fill in your values)
- Make sure Docker Desktop is running

All Docker commands should be run from the `docker/` directory:

```bash
cd docker
make [command]
```

**Development Commands:**
- `make help` - Show all available commands
- `make dev` or `make up` - Start development environment with hot reload
- `make build-dev` - Build development Docker images
- `make logs` - View all logs
- `make logs-app` - View application logs only
- `make logs-db` - View database logs only
- `make down` - Stop development environment
- `make restart` - Restart development environment
- `make rebuild-dev` - Rebuild and restart development

**Production Commands:**
- `make prod` - Start production environment
- `make build-prod` - Build production Docker images
- `make logs-prod` - View production logs
- `make down-prod` - Stop production environment
- `make restart-prod` - Restart production environment
- `make rebuild-prod` - Rebuild and restart production

**Utility Commands:**
- `make ps` - List running containers
- `make shell-app` - Open shell in app container
- `make shell-db` - Open MySQL shell
- `make clean` - Remove all containers and volumes (dangerous!)

**Important**:
- Development mode runs with hot reload - code changes in `src/` are automatically reflected
- Both MySQL and NestJS application run in Docker containers
- Development uses `docker-compose.dev.yml` and production uses `docker-compose.prod.yml`

## Architecture

### Core Structure

- **Entry Point**: [src/main.ts](src/main.ts) - Bootstraps NestJS app, configures CORS for production (`https://dev-manager-frontend.vercel.app`) and local (`http://localhost:3000`)
- **Module System**: Standard NestJS module/controller/service architecture
- **Root Module**: [src/app.module.ts](src/app.module.ts) - Main application module
- **Controller**: [src/app.controller.ts](src/app.controller.ts) - HTTP endpoints
- **Service**: [src/app.service.ts](src/app.service.ts) - Business logic

### TypeScript Configuration

- Uses `nodenext` module resolution for modern ESM/CommonJS interop
- Decorators enabled for NestJS
- Strict null checks enabled, but `noImplicitAny` is disabled
- Output directory: `dist/`

### Database

- **ORM**: TypeORM with MySQL2 driver
- **Configuration**: Database settings in [src/app.module.ts]
- **Entities**: Located in `src/entities/` with `.entity.ts` suffix
- **Synchronization**: Auto-sync enabled in development (disabled in production)
- **Environment Variables**: Database credentials in `.env` (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE)
- **Docker Setup**: MySQL 8.0 runs in a Docker container. In Docker environment, `DB_HOST` is automatically set to `mysql` (container name). For local development without Docker, use `DB_HOST=127.0.0.1`.

### External Integrations

- **Anthropic AI SDK** (`@anthropic-ai/sdk`) - AI capabilities integration
- **Environment Variables**: Uses `dotenv` for configuration (API keys stored in `.env`)

### Testing Setup

- Unit tests: Jest with `.spec.ts` suffix in `src/`
- E2E tests: Separate Jest config at [test/jest-e2e.json](test/jest-e2e.json)
- Coverage output: `coverage/` directory

## Notes

- The application uses NestJS CLI for scaffolding (`@nestjs/schematics`)
- CORS is pre-configured - update origins in [src/main.ts](src/main.ts:6-12) if adding new frontends
