# 📦 package.json 표준 스크립트 및 의존성 명세

본 문서는 신규 Next.js + PostgreSQL 프로젝트의 `package.json`에 포함되어야 하는 **표준 의존성(Dependencies) 및 실행 스크립트(Scripts)** 명세서입니다.

---

## 📋 1. 표준 스크립트 (Scripts)

```json
{
  "scripts": {
    "dev": "dotenv -e .env.development -- next dev",
    "build": "npm run lint && npm run test && next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint",
    "format": "prettier --write \"src/**/*.{ts,tsx,mts}\" \"docs/**/*.md\" \"*.{mjs,ts,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,mts}\" \"docs/**/*.md\" \"*.{mjs,ts,json,md}\"",
    "postinstall": "prisma generate",
    "db:migrate:local": "dotenv -e .env.development -- prisma migrate dev",
    "db:studio": "dotenv -e .env.development -- prisma studio",
    "check:types": "tsc --noEmit",
    "check:format": "npm run format:check",
    "check:agents": "jiti scripts/check-agents-size.ts",
    "plan:check": "jiti scripts/plan-harness.ts",
    "design:lint": "designmd lint DESIGN.md",
    "design:export": "designmd export --format css-tailwind DESIGN.md",
    "stitch": "npx tsx scripts/stitch-bridge.mts",
    "stitch:flow": "npx tsx scripts/stitch-bridge.mts flow",
    "stitch:refactor": "npx tsx scripts/stitch-bridge.mts refactor",
    "stitch:capture": "npx tsx scripts/stitch-bridge.mts capture",
    "stitch:sync-back": "npx tsx scripts/stitch-bridge.mts sync-back",
    "stitch:skeleton": "npx tsx scripts/stitch-skeleton.ts",
    "verify": "jiti scripts/verify-harness.ts",
    "verify:full": "jiti scripts/verify-harness.ts --full",
    "verify:types": "jiti scripts/verify-harness.ts --types",
    "verify:format": "jiti scripts/verify-harness.ts --format",
    "verify:fix": "jiti scripts/verify-harness.ts --fix",
    "verify:watch": "jiti scripts/verify-harness.ts --watch",
    "verify:docker": "bash scripts/docker-harness.sh"
  }
}
```

---

## 📦 2. 필수 의존성 패키지 (Dependencies)

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "lucide-react": "^0.564.0",
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@google/design.md": "^0.4.0",
    "@google/stitch-sdk": "^0.3.5",
    "@tailwindcss/postcss": "^4",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv-cli": "^11.0.0",
    "eslint": "^9.39.4",
    "eslint-config-next": "16.1.1",
    "eslint-config-prettier": "^10.1.8",
    "jiti": "^2.4.2",
    "playwright": "^1.62.1",
    "prettier": "^3.8.3",
    "prisma": "^5.22.0",
    "tailwindcss": "^4",
    "tsx": "^4.23.13",
    "typescript": "^5.7.0",
    "vitest": "^4.0.18"
  }
}
```

---

## ⚡ 3. 빠른 설치 명령어 (One-Liner Install)

```bash
# 기본 런타임 의존성
npm install @prisma/client lucide-react zod

# 개발 및 하네스 도구 의존성
npm install -D @google/design.md @google/stitch-sdk @tailwindcss/postcss @testing-library/react dotenv-cli eslint eslint-config-next eslint-config-prettier jiti playwright prettier prisma tailwindcss tsx typescript vitest
```
