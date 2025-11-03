import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1761978269659 implements MigrationInterface {
    name = 'Users1761978269659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // users 테이블 생성
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`email\` varchar(255) NOT NULL,
                \`github_id\` varchar(100) NOT NULL,
                \`user_name\` varchar(100) NOT NULL,
                \`avatar_url\` varchar(500) NULL,
                \`refresh_token_hash\` varchar(500) NULL,
                \`last_login_at\` timestamp NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
                UNIQUE INDEX \`IDX_09a2296ade1053a0cc4080bda4\` (\`github_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // users 테이블 삭제
        await queryRunner.query(`DROP INDEX \`IDX_09a2296ade1053a0cc4080bda4\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
