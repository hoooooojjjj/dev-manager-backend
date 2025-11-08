import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";

export enum ProjectStatus {
  INTAKE = "intake",
  RESEARCH = "research",
  DRAFT = "draft",
  REVIEW = "review",
  PROMPTS = "prompts",
  COMPLETED = "completed",
  ERROR = "error",
}

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 36, name: "user_id" })
  userId: string;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "varchar", length: 500, name: "notion_url" })
  notionUrl: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  repo: string | null;

  @Column({ type: "json", name: "focus_files" })
  focusFiles: string[];

  @Column({
    type: "varchar",
    length: 500,
    nullable: true,
    name: "output_notion_url",
  })
  outputNotionUrl: string | null;

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.INTAKE,
  })
  status: ProjectStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
