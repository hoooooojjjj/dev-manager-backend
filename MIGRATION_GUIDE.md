## 마이그레이션 관리 전략

### 📌 기본 원칙

#### 1. **엔티티 변경 → 마이그레이션 생성 → 실행**

엔티티를 변경할 때마다 다음 순서를 따라야 합니다:

```bash
# 1. 엔티티 파일 수정 (예: user.entity.ts)

# 2. 마이그레이션 파일 자동 생성
npm run migration:generate src/migrations/AddUserPhoneNumber

# 3. 생성된 마이그레이션 파일 검토 (src/migrations/에 생성됨)

# 4. 개발 DB에 적용
npm run migration:run

# 5. 테스트 후 Git 커밋
git add src/migrations/
git commit -m "feat: Add phone_number column to users table"
```

#### 2. **마이그레이션 파일은 절대 수정하지 않기**

- ✅ **올바른 방법**: 새로운 마이그레이션 파일 생성
- ❌ **잘못된 방법**: 이미 실행된 마이그레이션 파일 수정

**이유**:

- 마이그레이션 파일은 타임스탬프와 내용의 해시로 관리됩니다
- 이미 실행된 파일을 수정하면 다른 환경과 동기화가 깨집니다

#### 3. **마이그레이션은 순차적으로 누적**

TypeORM은 마이그레이션을 타임스탬프 순서대로 실행합니다:

```
1762757376155-ConsolidateSchema.ts        ← 현재 통합 마이그레이션
1762757400000-AddUserPhoneNumber.ts       ← 전화번호 추가
1762757500000-AddProjectDescription.ts    ← 프로젝트 설명 추가
1762757600000-CreateCommentsTable.ts      ← 댓글 테이블 추가
```

각 환경(개발, 실서버)은 `migrations` 테이블에 실행된 마이그레이션을 기록하고, 아직 실행되지 않은 마이그레이션만 실행합니다.

---
