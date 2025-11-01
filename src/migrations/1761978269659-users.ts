import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1761978269659 implements MigrationInterface {
    name = 'Users1761978269659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`github_id\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_09a2296ade1053a0cc4080bda4\` (\`github_id\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`user_name\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`avatar_url\` varchar(500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatar_url\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`user_name\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_09a2296ade1053a0cc4080bda4\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`github_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`name\` varchar(100) NOT NULL`);
    }

}
