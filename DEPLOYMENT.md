# Fly.io 배포 가이드

## 배포 방법

### 자동 배포 (GitHub Actions)

main 브랜치에 push하면 자동으로 배포

```bash
git push origin main
```

### 수동 배포

```bash
flyctl deploy --remote-only
```

---

## 🔐 환경 변수 설정

`.env.prod` 파일의 환경 변수를 Fly.io secrets로 자동 동기화:

```bash
./scripts/sync-fly-secrets.sh
```

스크립트가 자동으로 `flyctl secrets deploy`를 실행하여 앱을 재시작합니다.

---

## 🗄️ 데이터베이스 관리

### MySQL 접속 방법

#### 1. SSH 터널로 로컬 접속 (권장)

````bash
# 터널 생성 (로컬 3307 → Fly.io MySQL 3306으로 터널링)
flyctl proxy 3307:3306 -a dev-manager-mysql

MySQL Workbench 연결 설정:
Hostname: 127.0.0.1
Port: 3307
Username: root
Password: (Fly.io MySQL 비밀번호)
=> mysql workbench로 접속

### 마이그레이션 관리

#### 자동 마이그레이션

배포 시 `fly.toml`의 `release_command`가 자동 실행됩니다:

```toml
[deploy]
  release_command = 'npm run migration:run'
````

#### 마이그레이션 확인

```bash
# 로그에서 마이그레이션 확인
flyctl logs -a dev-manager-backend | grep migration

# 또는 실시간 확인
flyctl logs -a dev-manager-backend -f
```

#### 로컬에서 새 마이그레이션 생성

```bash
# 1. 엔티티 수정 후 마이그레이션 생성
npm run migration:generate -- src/migrations/마이그레이션이름

# 2. Git 커밋 & Push → 자동 배포 → 자동 마이그레이션 실행
git add .
git commit -m "feat: add migration"
git push origin main
```

### 백업

```bash
# SSH 터널을 통한 백업 (권장)
flyctl proxy 3307:3306 -a dev-manager-mysql
mysqldump -h 127.0.0.1 -P 3307 -u root -p dev_manager > backup_$(date +%Y%m%d).sql

# 또는 직접 접속
flyctl ssh console -a dev-manager-mysql
mysqldump -u root -p$MYSQL_ROOT_PASSWORD dev_manager > /tmp/backup.sql
```

---

## ✅ 배포 확인

```bash
# 앱 상태
flyctl status -a dev-manager-backend

# 로그 확인
flyctl logs -a dev-manager-backend

# 실시간 로그
flyctl logs -a dev-manager-backend -f

# 브라우저에서 열기
flyctl open -a dev-manager-backend

# Swagger API 문서
flyctl open -a dev-manager-backend /api-docs
```

---

## 🔧 문제 해결

### 배포 실패 시

```bash
# 상세 로그 확인
flyctl logs -a dev-manager-backend

# 앱 재시작
flyctl apps restart dev-manager-backend

# Secrets 확인
flyctl secrets list -a dev-manager-backend
```

### DB 연결 오류

```bash
# MySQL 상태 확인
flyctl status -a dev-manager-mysql
flyctl logs -a dev-manager-mysql

# Secrets 재설정
./scripts/sync-fly-secrets.sh
```
