import { MigrationInterface, QueryRunner } from "typeorm";

export class NotionUrlAndRepoToJson1762604408446 implements MigrationInterface {
  name = "NotionUrlAndRepoToJson1762604408446";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`projects\` MODIFY \`notion_urls\` json NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`projects\` MODIFY \`repos\` json NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`projects\` MODIFY \`notion_urls\` text NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`projects\` MODIFY \`repos\` text NOT NULL
    `);
  }
}
