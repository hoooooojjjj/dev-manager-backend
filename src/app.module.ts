import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { typeormConfig } from "./configs/typeorm.config";
import { AuthModule } from "./auth/auth.module";
import { ProjectsModule } from "./projects/projects.module";
import { SpecModule } from "./spec/spec.module";

dotenv.config();
@Module({
  imports: [TypeOrmModule.forRoot(typeormConfig), AuthModule, ProjectsModule, SpecModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
