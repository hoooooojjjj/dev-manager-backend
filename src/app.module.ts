import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { typeormConfig } from "./configs/typeorm.config";
import { AuthModule } from "./auth/auth.module";

dotenv.config();
@Module({
  imports: [TypeOrmModule.forRoot(typeormConfig), AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
