# 🚀 Next.js + PostgreSQL AI Enterprise Starter Kit

> **타 프로젝트 루트에 본 폴더를 넣고, AI에게 `"이 폴더를 분석해서 기본 구조를 만들어줘"`라고 지시하면 100% 자율 구축(Self-Bootstrapping)되는 엔터프라이즈 스타터 킷**

---

## 📌 1. 스타터 킷 소개 (Overview)

본 스타터 킷은 대규모 이커머스 및 데이터 집약형 프로덕션 환경에서 실전 검증된 **Next.js App Router + TypeScript + Tailwind CSS v4 + Prisma (PostgreSQL)** 엔터프라이즈 아키텍처의 정수를 모아둔 키트입니다.

타 프로젝트를 새로 시작할 때, 루트 디렉터리에 본 `starter-kit/` 폴더를 복사한 후 AI 에이전트(Antigravity 등)에게 분석 및 초기화를 지시하면, **AI가 프로젝트 전체의 시스템 지침, 코딩 규격, 4대 품질 하네스, 스티치 AI 연동 파이프라인, 그리고 표준 컴포넌트 원형까지 완전 자율 구축**합니다.

---

## 🗺️ 2. 스타터 킷 디렉터리 맵 (Directory Map)

```
starter-kit/
├── 🤖 AI_SCAFFOLD_DIRECTIVE.md            # [핵심] AI 에이전트 자율 구축 7단계 실행 프로토콜
├── 📖 README.md                           # [본 문서] 스타터 킷 총괄 안내 및 구조도
│
├── 📜 agents/                             # AI 에이전트 개발 표준 및 지침
│   ├── AGENTS.template.md                 # 범용 Single Source of Truth 시스템 지침 (English)
│   └── PR_WORKFLOW.md                     # Conventional Commits 및 PR 작성 표준
│
├── 📐 standards/                          # 프로젝트 아키텍처 및 4대 코딩 규격
│   ├── CODING_STANDARDS.md                # 전역 코딩 규격 (TypeScript Strict, RSC, Service Layer)
│   ├── MVVM_ARCHITECTURE.md               # MVVM + Single ViewData 클라이언트 아키텍처
│   ├── COMMON_UI_GUIDE.md                 # Atomic 공통 UI 컴포넌트 7대 범주 규격
│   ├── CORE_UTILS_GUIDE.md                # 코어 유틸리티 표준 (포맷, 파싱, 클립보드, 다운로드)
│   └── PRISMA_DTO_PATTERN.md              # Prisma.validator DTO Select 카탈로그 & Mapper 패턴
│
├── 💻 boilerplate/                        # 즉시 복사하여 사용하는 핵심 소스코드 원형
│   ├── components/ui/                     # 공통 UI 컴포넌트 (Button, Input, Card, CommonModal)
│   ├── lib/                               # 핵심 인프라 (EventDispatcher, FormatUtils, PrismaSelects)
│   └── hooks/                             # MVVM ViewModel 커스텀 훅 원형
│
├── 🛡️ harness/                            # 4대 전주기 품질 하네스 시스템
│   ├── HARNESS_GUIDE.md                   # 4대 하네스 총괄 철학 및 6단계 게이트 규격
│   ├── scripts/                           # 하네스 검증 스크립트 (verify, check-ast, plan)
│   └── docker/                            # Docker Sandbox 격리 검증 템플릿
│
├── 🎨 stitch/                             # Google Stitch 3기둥 UI 리디자인 팩
│   ├── STITCH_GUIDE.md                    # 스티치 양방향 라이프사이클 및 3기둥 리팩토링 가이드
│   ├── DESIGN.template.md                 # Google Stitch 공식 디자인 토큰 명세 (Tailwind v4)
│   ├── scripts/                           # Stitch 브리지, 뼈대 추출기, 풀페이지 캡처기
│   └── scenarios/                         # 1:1 화면/모달 인터랙션 캡처 시나리오 인터페이스
│
└── ⚙️ setup/                              # 초기화 명세 및 가이드
    ├── PACKAGE_JSON.md                    # package.json 표준 dependencies 및 scripts
    └── QUICK_START.md                     # 사람을 위한 5단계 빠른 시작 체크리스트
```

---

## ⚡ 3. 빠른 사용 방법 (How to Use)

### 방법 A: AI 에이전트에게 자율 구축 위임 (권장 🚀)

1. 신규 프로젝트 루트에 `starter-kit/` 폴더를 통째로 복사합니다.
2. AI 에이전트(Antigravity 등) 채팅창에 아래와 같이 입력합니다:

```text
starter-kit 폴더를 분석해서 프로젝트 기본 구조를 만들어줘.
```

3. AI 에이전트가 [`AI_SCAFFOLD_DIRECTIVE.md`](./AI_SCAFFOLD_DIRECTIVE.md)를 스스로 읽고, **7단계 자율 실행 프로토콜**에 따라 루트 설정, 의존성 구성, 스크립트 배치, `src/` 아키텍처 스캐폴딩, 초기 `npm run verify` 검증까지 완벽히 마친 후 보고합니다.

---

### 방법 B: 사람이 직접 수동으로 단계별 적용 (Manual)

1. **지침 & 토큰 배치**:
   - `agents/AGENTS.template.md` ➔ 프로젝트 루트의 `AGENTS.md`로 복사.
   - `stitch/DESIGN.template.md` ➔ 프로젝트 루트의 `DESIGN.md`로 복사.
   - `harness/docker/Dockerfile.harness` ➔ 프로젝트 루트의 `Dockerfile.harness`로 복사.
2. **의존성 & 스크립트 병합**:
   - `setup/PACKAGE_JSON.md`를 참고하여 `package.json`의 `scripts`, `dependencies`, `devDependencies`를 병합하고 `npm install` 실행.
3. **하네스 & 스티치 파이프라인 배치**:
   - `harness/scripts/*` 및 `stitch/scripts/*` ➔ `scripts/` 디렉터리로 복사.
4. **아키텍처 및 보일러플레이트 소스코드 이식**:
   - `boilerplate/components/ui/*` ➔ `src/components/ui/`로 복사.
   - `boilerplate/lib/*` ➔ `src/lib/`로 복사.
   - `boilerplate/hooks/*` ➔ `src/hooks/`로 복사.
5. **Living Docs 배치**:
   - `standards/*`, `harness/HARNESS_GUIDE.md`, `stitch/STITCH_GUIDE.md` ➔ `docs/` 디렉터리로 복사.
6. **초기 무결성 검증**:
   - `npm run verify`를 실행하여 0-에러 확인.

---

## 🌟 4. 스타터 킷의 5대 핵심 차별점

| 핵심 가치                                | 상세 설명                                                                                                                                                   |
| :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. 0-토큰 사전 차단 (Fail-Fast Gate)** | `npm run verify` 한 번으로 정적 타입, Prettier 포맷, AST 가드레일, 단위 테스트, 프로덕션 빌드까지 전주기를 3~5초 내에 로컬 CPU에서 자동 검증합니다.         |
| **2. AI 토큰 95% 절약 (진단서 초압축)**  | 빌드 에러 발생 시 수천 줄 터미널 로그 대신 `.harness/diagnostics.json`에 원인 3~5줄만 초슬림 JSON으로 압축하여 AI 컨텍스트 낭비를 원천 차단합니다.          |
| **3. 환각 0% Google Stitch 3기둥 연동**  | 시각적 스크린샷 + 마크다운 기획서 + 로직이 정제된 컴포넌트 JSX 뼈대(Skeleton)를 결합 주입하여 디자인 왜곡이나 허구적 요소 추가를 원천 봉쇄합니다.           |
| **4. MVVM + Single ViewData 아키텍처**   | 복잡한 폼과 상태를 단일 `viewData` 객체와 불변 `actions`로 캡슐화하고, 얕은 복사 참조 무결성을 통해 `React.memo` 하위 렌더링을 완벽 최적화합니다.           |
| **5. DTO Mapper & Prisma.validator**     | DB 엔티티가 UI나 Server Action에 날것으로 노출되지 않도록, `Prisma.validator` 기반의 중앙 집중형 DTO Select 카탈로그를 강제하여 런타임 크래시를 방지합니다. |
