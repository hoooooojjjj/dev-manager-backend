#!/bin/bash
# Fly.io Secrets 동기화 스크립트
# .env 파일의 환경 변수를 fly.io secrets로 자동 설정

set -e

echo "Fly.io Secrets 동기화 시작..."

# .env 파일 존재 확인
if [ ! -f .env ]; then
  echo "오류: .env 파일을 찾을 수 없습니다."
  echo ".env.example을 복사하여 .env 파일을 생성하고 값을 채워주세요."
  exit 1
fi

# flyctl 설치 확인
if ! command -v flyctl &> /dev/null; then
  echo "오류: flyctl이 설치되어 있지 않습니다."
  echo "설치 방법: https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
fi

# fly.io 로그인 확인
if ! flyctl auth whoami &> /dev/null; then
  echo "오류: fly.io에 로그인되어 있지 않습니다."
  echo "로그인: flyctl auth login"
  exit 1
fi

echo ""
echo ".env 파일에서 환경 변수를 읽어 fly.io secrets에 설정합니다..."
echo ""

# .env 파일 읽기 및 secrets 설정
while IFS='=' read -r key value; do
  # 빈 줄과 주석 건너뛰기
  if [[ -z "$key" || "$key" =~ ^#.* ]]; then
    continue
  fi

  # 앞뒤 공백 제거
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)

  # 값이 비어있으면 건너뛰기
  if [[ -z "$value" ]]; then
    echo "건너뛰기: $key (값이 비어있음)"
    continue
  fi

  # fly.toml의 [env]에 이미 설정된 변수는 건너뛰기
  if [[ "$key" == "PORT" || "$key" == "NODE_ENV" ]]; then
    echo "건너뛰기: $key (fly.toml에 설정됨)"
    continue
  fi

  echo "설정 중: $key"
  flyctl secrets set "$key=$value" --stage
done < .env

echo ""
echo "모든 secrets를 한 번에 배포합니다..."
flyctl secrets deploy

echo ""
echo "Fly.io secrets 동기화 완료!"
echo ""
echo "설정된 secrets 목록:"
flyctl secrets list
