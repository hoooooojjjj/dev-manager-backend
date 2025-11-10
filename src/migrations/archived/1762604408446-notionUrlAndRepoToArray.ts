import { MigrationInterface, QueryRunner } from "typeorm";

export class NotionUrlAndRepoToArray1762604408446
  implements MigrationInterface
{
  name = "NotionUrlAndRepoToArray1762604408446";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_projects_user\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_email\` ON \`users\``);
    await queryRunner.query(`DROP INDEX \`IDX_github_id\` ON \`users\``);
    await queryRunner.query(`DROP INDEX \`IDX_user_id\` ON \`projects\``);
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP COLUMN \`notion_url\``,
    );
    await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`repo\``);
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD \`notion_urls\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD \`repos\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_09a2296ade1053a0cc4080bda4\` (\`github_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_bd55b203eb9f92b0c8390380010\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_bd55b203eb9f92b0c8390380010\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_09a2296ade1053a0cc4080bda4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``,
    );
    await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`repos\``);
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP COLUMN \`notion_urls\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD \`repo\` varchar(500) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD \`notion_url\` varchar(500) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_user_id\` ON \`projects\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_github_id\` ON \`users\` (\`github_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_email\` ON \`users\` (\`email\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_projects_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
