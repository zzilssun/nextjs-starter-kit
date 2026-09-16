# 🚀 신규 프로젝트 빠른 시작 가이드 (Quick Start)

본 문서는 Next.js + PostgreSQL 기반 신규 프로젝트를 바닥부터 생성하고 스타터 킷을 적용하여 무결점 개발 환경을 구축하는 5단계 실무 체크리스트입니다.

---

## 📋 5단계 부트스트랩 체크리스트

### 1단계: Next.js 프로젝트 생성

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
cd my-app
```

### 2단계: 필수 의존성 설치

```bash
# 런타임 의존성
npm install @prisma/client lucide-react zod

# 개발 및 하네스 의존성
npm install -D @google/design.md @google/stitch-sdk @tailwindcss/postcss dotenv-cli jiti playwright prettier prisma tsx vitest
```

### 3단계: Prisma 초기화 & 환경변수 설정

```bash
npx prisma init --datasource-provider postgresql
```

`.env` 파일에 데이터베이스 연결 문자열과 스티치 API 키를 설정합니다:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
STITCH_API_KEY="your-google-stitch-api-key"
STITCH_PROJECT_ID="your-stitch-project-id"
```

### 4단계: 스타터 킷 파일 배치

1. **루트 파일**:
   - `AGENTS.template.md` ➔ `AGENTS.md`
   - `DESIGN.template.md` ➔ `DESIGN.md`
   - `Dockerfile.harness` ➔ `Dockerfile.harness`
2. **스크립트**:
   - `harness/scripts/*` 및 `stitch/scripts/*` ➔ `scripts/`로 복사
   - `docker-harness.sh`에 실행 권한 부여: `chmod +x scripts/docker-harness.sh`
3. **소스코드 보일러플레이트**:
   - `boilerplate/components/ui/*` ➔ `src/components/ui/`
   - `boilerplate/lib/*` ➔ `src/lib/`
   - `boilerplate/hooks/*` ➔ `src/hooks/`
4. **`package.json`**:
   - `setup/PACKAGE_JSON.md`의 `scripts` 목록을 병합합니다.

### 5단계: 첫 하네스 검증 실행

```bash
# Prisma 클라이언트 생성
npm run postinstall

# 전체 무결성 게이트 실행 (0-오류 검증)
npm run verify
```

`🎉 ALL HARNESS GATES PASSED! Ready to commit & deploy.` 메시지가 출력되면 모든 환경 세팅이 완료된 것입니다!
