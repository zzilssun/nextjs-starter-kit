# 🤖 AI Agent 자율 프로젝트 스캐폴딩 지침서 (AI Scaffold Directive)

> **AI 에이전트 필독**: 사용자가 `"starter-kit 폴더를 분석해서 프로젝트 기본 구조를 만들어줘"` 또는 `"스타터 킷을 적용해줘"`라고 요청했을 때, 본 지침서에 정의된 **7단계 자동 실행 프로토콜(7-Step Execution Protocol)**을 엄격하고 정확하게 순서대로 수행하십시오.

---

## 🎯 실행 목표

본 디렉터리(`docs/starter-kit/` 또는 `starter-kit/`) 내의 아키텍처 규격, 스크립트, 보일러플레이트를 타깃 프로젝트의 정규 구조로 복사·병합·스캐폴딩하여, 즉시 개발에 착수할 수 있는 **0-오류 Next.js + PostgreSQL 엔터프라이즈 환경**을 완성합니다.

---

## 📋 7단계 자율 실행 프로토콜 (The 7-Step Protocol)

### [1단계] 루트 코어 설정 파일 배치 (Root Configuration)

아래 템플릿 파일들을 프로젝트 루트로 복사합니다:

1. `agents/AGENTS.template.md` ➔ 프로젝트 루트의 `AGENTS.md`로 복사 (이름 변경 주의: `.template` 제거).
2. `stitch/DESIGN.template.md` ➔ 프로젝트 루트의 `DESIGN.md`로 복사 (이름 변경 주의: `.template` 제거).
3. `harness/docker/Dockerfile.harness` ➔ 프로젝트 루트의 `Dockerfile.harness`로 복사.

---

### [2단계] `package.json` 의존성 및 스크립트 병합 (Package Setup)

`setup/PACKAGE_JSON.md`의 명세를 바탕으로, 현재 프로젝트 루트의 `package.json`을 업데이트합니다:

1. **scripts 병합**:
   - `build`, `test`, `lint`, `format`, `format:check`
   - `plan:check`, `design:lint`, `design:export`
   - `stitch`, `stitch:flow`, `stitch:refactor`, `stitch:capture`, `stitch:sync-back`, `stitch:skeleton`, `stitch:check`
   - `verify`, `verify:full`, `verify:types`, `verify:format`, `verify:fix`, `verify:watch`, `verify:docker`
2. **필수 dependencies 확인 및 설치**:
   - `@prisma/client`, `lucide-react`, `zod`
3. **필수 devDependencies 확인 및 설치**:
   - `@google/design.md`, `@google/stitch-sdk`, `@tailwindcss/postcss`, `playwright`, `prettier`, `prisma`, `tsx`, `vitest`, `jiti`, `dotenv-cli`
4. 패키지 매니저 실행 (`npm install` 또는 `pnpm install`).

---

### [3단계] `scripts/` 하네스 및 스티치 파이프라인 배치 (Automation Pipeline)

프로젝트 루트의 `scripts/` 디렉터리에 다음 스크립트 파일들을 생성/복사합니다:

1. `harness/scripts/verify-harness.ts` ➔ `scripts/verify-harness.ts`
2. `harness/scripts/check-ast-guardrails.ts` ➔ `scripts/check-ast-guardrails.ts`
3. `harness/scripts/plan-harness.ts` ➔ `scripts/plan-harness.ts`
4. `harness/docker/docker-harness.sh` ➔ `scripts/docker-harness.sh` (실행 권한 `chmod +x` 부여)
5. `stitch/scripts/stitch-bridge.mts` ➔ `scripts/stitch-bridge.mts`
6. `stitch/scripts/stitch-skeleton.ts` ➔ `scripts/stitch-skeleton.ts`
7. `stitch/scripts/capture-fullpage.ts` ➔ `scripts/capture-fullpage.ts`
8. `stitch/scenarios/types.ts` ➔ `scripts/scenarios/types.ts`

---

### [4단계] `src/` 엔터프라이즈 아키텍처 스캐폴딩 (Source Tree Scaffolding)

`src/` 디렉터리 구조를 생성하고, `boilerplate/`의 핵심 소스코드를 이식합니다:

```
src/
├── actions/                               # Thin Controller Server Actions 폴더
├── app/                                   # Next.js App Router (RSC 우선)
├── components/
│   └── ui/                                # Atomic 공통 UI 컴포넌트
│       ├── Button.tsx                     # boilerplate/components/ui/Button.tsx 복사
│       ├── Input.tsx                      # boilerplate/components/ui/Input.tsx 복사
│       ├── Card.tsx                       # boilerplate/components/ui/Card.tsx 복사
│       └── CommonModal.tsx                # boilerplate/components/ui/CommonModal.tsx 복사
├── hooks/
│   └── usecases/                          # MVVM ViewModel 커스텀 훅
│       └── useExampleViewModel.ts         # boilerplate/hooks/usecases/useExampleViewModel.ts 복사
├── lib/
│   ├── event-dispatcher.ts                # boilerplate/lib/event-dispatcher.ts 복사
│   ├── prisma.ts                          # PrismaClient 싱글톤 인스턴스
│   ├── prisma-selects/                    # Prisma.validator DTO Select 카탈로그
│   │   └── index.ts                       # boilerplate/lib/prisma-selects/index.ts 복사
│   └── utils/
│       ├── format-utils.ts                # boilerplate/lib/format-utils.ts 복사
│       └── index.ts                       # utils re-export 허브
└── services/
    └── server/                            # 비즈니스 로직 및 DB 서비스 클래스
```

---

### [5단계] `docs/` Living Documentation 체계 정립 (Docs Infrastructure)

문서화 및 형상 관리를 위해 `docs/` 디렉터리를 구성합니다:

1. `standards/`의 모든 가이드 문서를 `docs/`로 복사:
   - `CODING_STANDARDS.md` ➔ `docs/CODING_STANDARDS.md`
   - `MVVM_ARCHITECTURE.md` ➔ `docs/STANDARDS_MVVM.md`
   - `COMMON_UI_GUIDE.md` ➔ `docs/STANDARDS_COMMON_UI.md`
   - `CORE_UTILS_GUIDE.md` ➔ `docs/CORE_UTILS_GUIDE.md`
   - `PRISMA_DTO_PATTERN.md` ➔ `docs/PRISMA_DTO_PATTERN.md`
2. 하네스 및 스티치 가이드 복사:
   - `harness/HARNESS_GUIDE.md` ➔ `docs/HARNESS_MASTER_GUIDE.md`
   - `stitch/STITCH_GUIDE.md` ➔ `docs/STITCH_REDESIGN_GUIDE.md`
   - `agents/PR_WORKFLOW.md` ➔ `docs/PR_EXAMPLE.md`
3. 업데이트 로그 인프라 초기화:
   - `docs/UPDATE_LOG.md` 생성 (최근 7일 업데이트 인덱스).
   - `docs/logs/updates/` 디렉터리 생성 및 오늘 날짜의 `update-YYYY-MM-DD.md` 초기화.
4. 스티치 레지스트리 초기화:
   - `docs/stitch/registry.json` 빈 객체(`{}`)로 생성.
   - `docs/stitch/screens/` 디렉터리 생성.

---

### [6단계] 데이터베이스 및 Prisma 초기화 (Database Setup)

1. `prisma/schema.prisma`가 없으면 `npx prisma init --datasource-provider postgresql`을 실행합니다.
2. `src/lib/prisma.ts`에 Prisma 인스턴스 싱글톤 파일을 생성합니다:

   ```typescript
   import { PrismaClient } from "@prisma/client";

   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

   export const prisma = globalForPrisma.prisma ?? new PrismaClient();

   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
   ```

3. `npx prisma generate`를 실행하여 클라이언트 타입을 동기화합니다.

---

### [7단계] 전주기 무결성 검증 및 자가 치유 (Verification & Self-Healing)

1. `npm run format`을 실행하여 전체 코드의 Prettier 스타일을 정렬합니다.
2. `npm run check:types` (`tsc --noEmit`)를 실행하여 타입 오류를 0건으로 만듭니다.
3. `npm run verify`를 실행하여 6단계 통합 하네스 게이트가 100% 통과하는지 확인합니다.
   - 만약 에러가 발생하면 `.harness/diagnostics.json`을 읽고 원포인트 수정한 후 통과할 때까지 반복합니다.
4. 사용자에게 자율 스캐폴딩 완료 요약 보고서를 한국어로 브리핑합니다:
   - 생성된 핵심 디렉터리 및 파일 목록
   - 사용 가능한 주요 `npm run ...` 명령어 안내
   - 다음 개발 단계 권장 사항
