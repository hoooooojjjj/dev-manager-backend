import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Project } from "../../projects/entities/project.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  // GitHub OAuth 정보
  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 100, unique: true, name: "github_id" })
  githubId: string;

  @Column({ type: "varchar", length: 100, name: "user_name" })
  userName: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "avatar_url" })
  avatarUrl: string | null;

  // 로그인 정보
  @Column({
    type: "varchar",
    length: 500,
    nullable: true,
    name: "refresh_token_hash",
  })
  refreshTokenHash: string | null;

  @Column({
    type: "timestamp",
    nullable: true,
    name: "last_login_at",
  })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
