import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: [
      "https://dev-manager-frontend.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // 허용되지 않은 속성이 있으면 에러
      transform: true, // 자동 타입 변환
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle("Dev Manager API")
    .setDescription("AI 개발 명세서 자동 생성 시스템 API")
    .setVersion("1.0")
    .addTag("auth", "인증/인가 관련 API")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "JWT 토큰을 입력하세요",
        in: "header",
      },
      "access-token",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침 시에도 인증 정보 유지
    },
  });

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
