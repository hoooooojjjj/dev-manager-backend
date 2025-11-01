import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * TypeORM CLI용 DataSource 설정
 * 마이그레이션 생성 및 실행에 사용됩니다.
 */
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "dev_manager",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  synchronize: false, // 마이그레이션 사용 시 false
  logging: process.env.NODE_ENV !== "production",
});
