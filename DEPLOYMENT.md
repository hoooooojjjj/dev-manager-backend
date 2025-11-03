# Fly.io 배포 가이드

## 🗄️ MySQL 데이터베이스 설정

## 🔐 환경 변수 설정

### 자동 설정 (권장)

프로젝트에 포함된 스크립트를 사용하여 `.env` 파일의 환경 변수를 자동으로 Fly.io에 설정:

```bash
# 1. .env 파일 생성 (없는 경우)
cp .env.example .env

# 2. .env 파일 수정 (실제 값 입력)
# 특히 다음 값들을 반드시 설정:
# - DB_HOST: MySQL 호스트 (PlanetScale 또는 Fly.io MySQL 앱의 호스트)
# - DB_PASSWORD: MySQL 비밀번호
# - ANTHROPIC_API_KEY: Anthropic API 키
# - JWT_SECRET: 강력한 랜덤 문자열
# - GITHUB_CLIENT_ID_PROD, GITHUB_CLIENT_SECRET_PROD

# 3. 스크립트 실행
./scripts/sync-fly-secrets.sh
```

### 수동 설정

```bash
# 개별 설정
flyctl secrets set ANTHROPIC_API_KEY=your_api_key

# 모든 secrets 한 번에 배포
flyctl secrets deploy
```

### 설정 확인

```bash
# 설정된 secrets 목록 확인 (값은 보이지 않음)
flyctl secrets list
```

---

## ⚙️ GitHub Actions 설정

## 🛠️ 수동 배포

CI/CD 없이 로컬에서 직접 배포하는 방법:

```bash
# 현재 디렉토리에서 배포
flyctl deploy

# 또는 원격 빌더 사용 (로컬 Docker 불필요)
flyctl deploy --remote-only
```

---

## ✅ 배포 확인

### 1. 앱 상태 확인

```bash
# 앱 상태
flyctl status

# 최근 로그 확인
flyctl logs

# 실시간 로그 스트리밍
flyctl logs -f
```

### 2. 웹 브라우저에서 확인

```bash
# 브라우저에서 앱 열기
flyctl open

# Swagger API 문서 확인
flyctl open /api-docs
```

### 3. 헬스체크 확인

```bash
# 앱 URL 확인
flyctl info

# curl로 헬스체크
curl https://dev-manager-backend.fly.dev/
```

### 4. 데이터베이스 마이그레이션 확인

배포 시 자동으로 `npm run migration:run`이 실행됩니다. (fly.toml의 `release_command` 설정)

로그에서 마이그레이션 성공 여부를 확인:

```bash
flyctl logs | grep migration
```

---

## 🐛 문제 해결

### 배포 실패

```bash
# 상세 로그 확인
flyctl logs

# 앱 재시작
flyctl apps restart

# 설정 확인
flyctl config show
```

### 데이터베이스 연결 오류

```bash
# DB 환경 변수 확인
flyctl secrets list

# DB 연결 테스트 (MySQL 앱에 SSH 접속)
flyctl ssh console -a dev-manager-backend
> node -e "console.log(process.env.DB_HOST)"
```

### 환경 변수 누락

```bash
# 모든 secrets 재설정
./scripts/sync-fly-secrets.sh

# 또는 개별 설정
flyctl secrets set KEY=value
```

### 빌드 오류

```bash
# 로컬에서 Docker 빌드 테스트
docker build -f docker/Dockerfile.prod -t test-build .

# 빌드 캐시 무시하고 재배포
flyctl deploy --no-cache
```

### 메모리 부족

fly.toml의 VM 메모리를 증가:

```toml
[[vm]]
  memory = '2gb'  # 1gb → 2gb로 변경
```

---

## 📊 모니터링 및 관리

### 스케일링

```bash
# VM 수 조정
flyctl scale count 2  # 2개의 인스턴스

# VM 크기 조정
flyctl scale vm shared-cpu-2x --memory 2048
```

### 비용 최적화

fly.toml의 auto_stop 설정으로 트래픽 없을 때 자동 중지:

```toml
[http_service]
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0  # 트래픽 없으면 완전 중지
```

### 백업

```bash
# 데이터베이스 백업 (MySQL 앱의 경우)
flyctl ssh console -a dev-manager-mysql
> mysqldump -u root -p dev_manager > backup.sql
```
