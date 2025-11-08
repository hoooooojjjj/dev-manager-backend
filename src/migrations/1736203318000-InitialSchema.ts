import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1736203318000 implements MigrationInterface {
  name = "InitialSchema1736203318000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // users 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`github_id\` varchar(100) NOT NULL,
        \`user_name\` varchar(100) NOT NULL,
        \`avatar_url\` varchar(500) NULL,
        \`refresh_token_hash\` varchar(500) NULL,
        \`last_login_at\` timestamp NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_email\` (\`email\`),
        UNIQUE INDEX \`IDX_github_id\` (\`github_id\`)
      ) ENGINE=InnoDB
    `);

    // projects 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`projects\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`notion_url\` varchar(500) NOT NULL,
        \`repo\` varchar(500) NOT NULL,
        \`focus_files\` json NOT NULL,
        \`output_notion_url\` varchar(500) NOT NULL,
        \`status\` enum('intake', 'research', 'draft', 'review', 'prompts', 'completed', 'error') NOT NULL DEFAULT 'intake',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_user_id\` (\`user_id\`),
        CONSTRAINT \`FK_projects_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 외래키 제약조건 삭제
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_projects_user\``,
    );

    // 테이블 삭제 (순서 중요: 참조하는 테이블 먼저)
    await queryRunner.query(`DROP TABLE \`projects\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
