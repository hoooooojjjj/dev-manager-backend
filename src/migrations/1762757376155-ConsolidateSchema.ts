import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

/**
 * 통합 마이그레이션: 모든 DB 상태를 최신 스키마로 안전하게 동기화합니다.
 * - 빈 DB: 모든 테이블을 최신 스키마로 생성
 * - 오래된 DB: 필요한 컬럼 변경 작업 수행
 * - 최신 DB: 이미 최신 상태이므로 아무 작업도 하지 않음
 */
export class ConsolidateSchema1762757376155 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. users 테이블 생성 또는 확인
    const usersTableExists = await queryRunner.hasTable("users");
    
    if (!usersTableExists) {
      // 테이블이 없으면 최신 스키마로 생성
      await queryRunner.createTable(
        new Table({
          name: "users",
          columns: [
            {
              name: "id",
              type: "varchar",
              length: "36",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "uuid",
            },
            {
              name: "email",
              type: "varchar",
              length: "255",
              isUnique: true,
            },
            {
              name: "github_id",
              type: "varchar",
              length: "100",
              isUnique: true,
            },
            {
              name: "user_name",
              type: "varchar",
              length: "100",
            },
            {
              name: "avatar_url",
              type: "varchar",
              length: "500",
              isNullable: true,
            },
            {
              name: "refresh_token_hash",
              type: "varchar",
              length: "500",
              isNullable: true,
            },
            {
              name: "last_login_at",
              type: "timestamp",
              isNullable: true,
            },
            {
              name: "created_at",
              type: "datetime",
              precision: 6,
              default: "CURRENT_TIMESTAMP(6)",
            },
            {
              name: "updated_at",
              type: "datetime",
              precision: 6,
              default: "CURRENT_TIMESTAMP(6)",
              onUpdate: "CURRENT_TIMESTAMP(6)",
            },
          ],
        }),
        true
      );
      console.log("✓ users 테이블 생성 완료");
    } else {
      console.log("✓ users 테이블 이미 존재");
    }

    // 2. projects 테이블 생성 또는 업데이트
    const projectsTableExists = await queryRunner.hasTable("projects");
    
    if (!projectsTableExists) {
      // 테이블이 없으면 최신 스키마로 생성
      await queryRunner.createTable(
        new Table({
          name: "projects",
          columns: [
            {
              name: "id",
              type: "varchar",
              length: "36",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "uuid",
            },
            {
              name: "user_id",
              type: "varchar",
              length: "36",
            },
            {
              name: "title",
              type: "varchar",
              length: "255",
            },
            {
              name: "notion_urls",
              type: "json",
            },
            {
              name: "repos",
              type: "json",
            },
            {
              name: "focus_files",
              type: "json",
            },
            {
              name: "output_notion_url",
              type: "varchar",
              length: "500",
            },
            {
              name: "status",
              type: "enum",
              enum: ["intake", "research", "draft", "review", "prompts", "completed", "error"],
              default: "'intake'",
            },
            {
              name: "created_at",
              type: "datetime",
              precision: 6,
              default: "CURRENT_TIMESTAMP(6)",
            },
            {
              name: "updated_at",
              type: "datetime",
              precision: 6,
              default: "CURRENT_TIMESTAMP(6)",
              onUpdate: "CURRENT_TIMESTAMP(6)",
            },
          ],
        }),
        true
      );

      // Foreign key 추가
      await queryRunner.createForeignKey(
        "projects",
        new TableForeignKey({
          columnNames: ["user_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "users",
          onDelete: "CASCADE",
        })
      );
      console.log("✓ projects 테이블 생성 완료");
    } else {
      // 테이블이 존재하면 필요한 컬럼 변경 수행
      console.log("✓ projects 테이블 이미 존재 - 컬럼 업데이트 확인 중...");

      // notion_url → notion_urls 마이그레이션
      const hasOldNotionUrl = await queryRunner.hasColumn("projects", "notion_url");
      const hasNewNotionUrls = await queryRunner.hasColumn("projects", "notion_urls");
      
      if (hasOldNotionUrl && !hasNewNotionUrls) {
        // 기존 데이터를 배열로 변환하여 새 컬럼에 저장
        await queryRunner.query(`
          ALTER TABLE \`projects\` ADD \`notion_urls\` JSON NOT NULL
        `);
        
        // 기존 데이터 마이그레이션
        await queryRunner.query(`
          UPDATE \`projects\` 
          SET \`notion_urls\` = JSON_ARRAY(\`notion_url\`)
        `);
        
        // 기존 컬럼 삭제
        await queryRunner.query(`
          ALTER TABLE \`projects\` DROP COLUMN \`notion_url\`
        `);
        console.log("  → notion_url을 notion_urls(json)로 변환 완료");
      } else if (hasNewNotionUrls) {
        // notion_urls가 text 타입이면 json으로 변경
        const notionUrlsColumn = await queryRunner.query(`
          SELECT DATA_TYPE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'projects' 
            AND COLUMN_NAME = 'notion_urls'
        `);
        
        if (notionUrlsColumn[0]?.DATA_TYPE === "text") {
          await queryRunner.query(`
            ALTER TABLE \`projects\` MODIFY \`notion_urls\` JSON NOT NULL
          `);
          console.log("  → notion_urls를 text에서 json으로 변환 완료");
        }
      }

      // repo → repos 마이그레이션
      const hasOldRepo = await queryRunner.hasColumn("projects", "repo");
      const hasNewRepos = await queryRunner.hasColumn("projects", "repos");
      
      if (hasOldRepo && !hasNewRepos) {
        // 기존 데이터를 배열로 변환하여 새 컬럼에 저장
        await queryRunner.query(`
          ALTER TABLE \`projects\` ADD \`repos\` JSON NOT NULL
        `);
        
        // 기존 데이터 마이그레이션
        await queryRunner.query(`
          UPDATE \`projects\` 
          SET \`repos\` = JSON_ARRAY(\`repo\`)
        `);
        
        // 기존 컬럼 삭제
        await queryRunner.query(`
          ALTER TABLE \`projects\` DROP COLUMN \`repo\`
        `);
        console.log("  → repo를 repos(json)로 변환 완료");
      } else if (hasNewRepos) {
        // repos가 text 타입이면 json으로 변경
        const reposColumn = await queryRunner.query(`
          SELECT DATA_TYPE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'projects' 
            AND COLUMN_NAME = 'repos'
        `);
        
        if (reposColumn[0]?.DATA_TYPE === "text") {
          await queryRunner.query(`
            ALTER TABLE \`projects\` MODIFY \`repos\` JSON NOT NULL
          `);
          console.log("  → repos를 text에서 json으로 변환 완료");
        }
      }
    }

    console.log("✅ 모든 테이블이 최신 스키마로 동기화되었습니다.");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // down 마이그레이션은 복잡한 데이터 변환이 포함되어 있어 안전하게 롤백하기 어렵습니다.
    // 필요시 수동으로 데이터베이스를 복원하는 것을 권장합니다.
    console.log("⚠️  이 마이그레이션은 down(롤백)을 지원하지 않습니다.");
    console.log("⚠️  필요시 데이터베이스 백업에서 복원해주세요.");
  }

}
