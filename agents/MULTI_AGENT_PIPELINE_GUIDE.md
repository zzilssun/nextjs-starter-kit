# 🤖 멀티 에이전트 개발 파이프라인 가이드 (Multi-Agent Pipeline Guide)

본 문서는 Next.js + PostgreSQL 엔터프라이즈 환경에서 복잡하고 리스크가 높은 기능 개발 시, **기획(Discovery 4인) ➔ 계획(Planner) ➔ 테스트 설계(Test Architect TDD) ➔ 격리 구현(Coder) ➔ 검증 및 하네스(QA Tester & Reviewer)**로 이어지는 5단계 협업 파이프라인을 체계화한 공식 지침입니다.

---

## 🧭 1. 멀티 에이전트 파이프라인 개요 및 듀얼 트랙 (Dual-Track)

### 1.1 듀얼 트랙 라우팅 (Lightweight vs Full Multi-Agent)

토큰 소비 효율화와 개발 생산성을 위해 작업의 영향도(Blast Radius)에 따라 2가지 트랙으로 자동 분기합니다:

```
[ 사용자 작업 요청 ]
       │
       ▼
 ─── 파이프라인 자동 판별 (Triage) ───
  ├─ [A] 단순 수정 (오타, CSS 스타일, 단일 컴포넌트 단순 UI, 국소적 복사)
  │    └─► ⚡ 경량 패스트트랙 (Lightweight Fast-Track) : Coder + Reviewer (5-Gate)
  │
  └─ [B] 고위험 작업 (Prisma 스키마, 결제/금융 로직, 외부 3rd-party API, 인증/보안)
       └─► 🏛️ 풀 멀티 에이전트 팀 (Full Multi-Agent Team) : 5단계 전원 투입
```

- **경량 트랙 (Lightweight Fast-Track)**: 단일 파일 잎사귀(leaf) 수정, 텍스트/스타일 변경 등 저위험 작업 시 Discovery 및 Test Architect 단계를 생략하고 단일 Coder + Reviewer(하네스 5-Gate)로 즉시 실행합니다.
- **풀팀 트랙 (Full Multi-Agent Team)**: DB 스키마, 결제/금융 로직, 외부 핵심 API 연동 등 리스크가 수반되는 고위험 작업 시 5단계 팀 전원이 순차 협업합니다.
- **사용자 임의 오버라이드**:
  - *"경량 모드로 해줘"*, *"빠르게 고쳐줘"* ➔ 즉시 경량 트랙 전환
  - *"에이전트 풀팀으로 해줘"*, *"기획/테스트팀 다 투입해줘"* ➔ 즉시 풀팀 가동

---

### 1.2 작업 시작 시 트랙 배지 표기 표준 (Proactive Track Announcement)

에이전트는 사용자의 **각 채팅 요청/질문에 응답할 때, 답변의 맨 첫 줄에 1회만** 현재 적용 중인 트랙 배지와 사유(Rationale)를 명시합니다.  
단, 한 턴 내에서 명령어를 실행하거나 백그라운드 태스크 결과를 확인하는 등의 **중간 세부 진행 단계에서는 배지를 중복 출력하지 않고** 진행 내용만 간결하게 안내합니다:

- **경량 트랙 진입 시 (답변 시작 시 1회)**:
  ```markdown
  > ⚡ **[Pipeline Track: Lightweight Fast-Track]** (Rationale: Low blast radius / single-file leaf change / explicit user override)
  ```
- **풀팀 트랙 진입 시 (답변 시작 시 1회)**:
  ```markdown
  > 🏛️ **[Pipeline Track: Full Multi-Agent Team]** (Rationale: High risk / Prisma schema / financial transaction / external API / explicit user override)
  ```

---

### 1.3 서브에이전트 인보크 필수 준수 (Mandatory Subagent Delegation)

풀 멀티 에이전트 트랙이 활성화(위험도 자동 판별 또는 사용자의 명시적 요청)된 경우, 메인 에이전트가 단독 세션에서 코드를 직접 수정하는 행위는 엄격히 금지됩니다:
1. **정식 `invoke_subagent` 도구 호출 의무**: 각 단계별 전문 역할(`Test Architect`, `Coder`, `QA Tester`, `Reviewer` 등)에 맞는 서브에이전트를 `invoke_subagent`로 명시적으로 인보크하여 독립 컨텍스트에서 수행해야 합니다.
2. **시뮬레이션 및 우회 금지**: 메인 턴 내에서 에이전트 역할을 텍스트로만 흉내 내거나 파일을 직접 수정하는 것은 파이프라인 거버넌스 위반(Delegation Failure)입니다.
3. **UI 투명성 보장**: 사용자는 항상 시스템 UI 상단에서 실행 중인 서브에이전트 라이프사이클(`Running...`)을 실시간으로 확인할 수 있어야 합니다.

---

## 🏛️ 2. 5단계 파이프라인 상세 실행 프로토콜

```
[ Phase 1: Discovery Team ] ──► [ Phase 2: Planner ] ──► [ Phase 3: Test Architect ]
  • PO (요구사항 정형화)           • PR 구현 계획서 수립        • Shift-Left TDD 테스트 선행 작성
  • Tech (Architecture/DB)        • Functional + Tech 분리     • 실패하는 *.test.ts 사전 커밋
  • UX (Tailwind/Common UI)       • npm run plan:check (100점)
  • Red-Team (엣지/보안/공격)
                                                                    │
                                                                    ▼
[ Phase 5: QA Tester & Reviewer ] ◄──────────────────── [ Phase 4: Isolated Coder ]
  • QA Tester (시나리오/회귀 검증)                             • 독립 워크스페이스 순수 비즈니스 로직 구현
  • Reviewer (5대 하네스 게이트 통과)                           • 선행 테스트 통과 검증 (Green)
```

### Phase 1: 기획 & 분석 팀 (Discovery 4인)
1. **Product Owner (PO)**: 사용자 요구사항의 본질을 분석하고 비즈니스 목표 및 엣지 유저 플로우 정의.
2. **Tech Lead**: Next.js RSC, Prisma 스키마 관계, 3rd-party API 제약, 데이터 정합성 사전 검토.
3. **UX Designer**: `@/components/ui` 원자 컴포넌트 재사용성, M3 규격, 터치 타겟(최소 48x48px), 모달 반응형 확인.
4. **Red-Team Challenger**: API Rate Limit, 동시성 레이스 컨디션, 오버플로, 인증 탈취 등 극한의 예외 케이스 공격.

### Phase 2: 계획 및 검증 (Planner)
- Discovery 산출물을 취합하여 `docs/implementation_plan/YYYY-MM-DD_PR_{ID}.md`에 표준 템플릿(기능 명세서 + 기술 구현 계획서)으로 계획 작성.
- `npm run plan:check` 실행하여 100/100점 획득 후 사용자 승인 요청.
- 사용자 명시적 시작 지시(**"작업을 시작해줘"**) 접수 시 Phase 3 전환.

### Phase 3: 테스트 엔지니어링 (Test Architect & Shift-Left TDD)
- 구현 착수 전, 실패하는 Vitest 테스트 코드(`*.test.ts`)를 선행 작성.
- 비즈니스 도메인 무결성, API DTO 매핑, 에러 처리 로직에 대한 엄격한 단언문(Assertion) 구성.

### Phase 4: 격리 구현 (Isolated Coder)
- Phase 3에서 작성된 테스트를 통과(Green)시키는 비즈니스 로직 및 UI 구현.
- `src/actions/` (Thin Controller), `src/services/server/` (Service Layer), `src/hooks/usecases/` (MVVM ViewModel) 규격 준수.

### Phase 5: 전주기 검증 (QA Tester & 5-Gate Reviewer)
- **QA Tester**: 시나리오 기반 통합 테스트 및 부수효과(회귀) 여부 전수 검증.
- **Reviewer**: 5대 품질 하네스 게이트 전수 통과 확인:
  1. `[Gate 1]` TypeScript 정적 타입 검사 (`tsc --noEmit`)
  2. `[Gate 2]` Prettier 코드 포맷팅 무결성 (`format:check`)
  3. `[Gate 3]` AST 아키텍처 및 린트 가드레일 + `AGENTS.md` 크기 예산 감사 (`npm run check:agents`)
  4. `[Gate 4]` 단위 및 통합 테스트 (`vitest run`)
  5. `[Gate 5]` Next.js 프로덕션 빌드 (`next build`)

---

## 🛡️ 3. 하네스 자동 회귀 방지 (Circuit Breaker)

- 동일한 에러 5회 연속 발생 시 즉시 실행을 중단하고 사용자에게 상황을 보고합니다.
- `AGENTS.md`의 크기가 40KB를 초과할 경우 `npm run check:agents`가 즉시 빌드를 차단하여 시스템 프롬프트 잘림(Truncation)을 원천 방지합니다.
