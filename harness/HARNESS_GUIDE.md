# 🛡️ 엔터프라이즈 전주기 품질 하네스 총괄 가이드 (Harness Master Guide)

본 문서는 소프트웨어 개발 및 AI 페어 프로그래밍 전 과정에서 버그를 0토큰 조기 차단(Fail-Fast)하고 100% 무결점 프로덕션 배포를 달성하기 위한 **엔터프라이즈 품질 하네스 시스템** 가이드입니다.

---

## 📌 1. 하네스 시스템 철학 (Philosophy)

AI와 협업할 때 가장 큰 위험은 **(1) 타입/빌드 깨짐의 방치**, **(2) 긴 에러 로그로 인한 AI 토큰 낭비**, **(3) 아키텍처 규칙(`any` 타입 남발 등) 위반**입니다.
본 하네스 시스템은 다음 3대 기술로 이를 완벽히 방어합니다:

1. **로컬 CPU 0-토큰 사전 차단**: LLM에게 오류 수정을 요청하기 전에 로컬 CPU 도구(`tsc`, `prettier`, AST 정규식, `vitest`, `next build`)로 에러를 즉각 검출합니다.
2. **진단서 초압축 (Diagnostics Pruning)**: 수천 줄의 빌드 에러 로그를 3~5줄의 구조화된 `.harness/diagnostics.json`으로 초슬림 압축하여 AI 컨텍스트 낭비를 95% 줄입니다.
3. **Fail-Fast 단계별 게이트**: 앞 단계가 실패하면 즉시 중단하여 불필요한 후속 연산을 차단합니다.

---

## 🗺️ 2. 6단계 통합 빌드 게이트 파이프라인

`npm run verify` (또는 `npm run verify:full`) 실행 시 다음 6단계 게이트가 순차적으로 실행됩니다:

```
[ Step 1: Static Type Check ]
  └─ npx tsc --noEmit (0 타입 에러 검증)
       │
[ Step 2: Code Formatting Integrity ]
  └─ npm run format:check (100% Prettier 호환성 검증)
       │
[ Step 3: Lint & AST Guardrails ]
  └─ scripts/check-ast-guardrails.ts (any 타입 등 아키텍처 규칙 실시간 감시)
       │
[ Step 4: Unit & Integration Tests ]
  └─ npm test (Vitest 단위 테스트 100% 통과)
       │
[ Step 5: Next.js Production Build ]
  └─ npx next build (Vercel 프로덕션 번들 빌드 검증)
       │
[ Step 6: Docker Container Sandbox (선택) ]
  └─ bash scripts/docker-harness.sh (호스트 무오염 격리 빌드)
```

---

## 🧭 3. 주요 하네스 CLI 명령어

| 명령어                      | 용도 및 특징                                                                      |
| :-------------------------- | :-------------------------------------------------------------------------------- |
| **`npm run verify`**        | 6단계 통합 게이트 실행 (기본 검증 모드, 실패 시 `.harness/diagnostics.json` 생성) |
| **`npm run verify:full`**   | 전체 파일 대상 풀스캔 무결성 검증                                                 |
| **`npm run verify:types`**  | `tsc --noEmit` 단일 단계 초고속 타입 검사                                         |
| **`npm run verify:format`** | Prettier 포맷팅 무결성 단일 검사                                                  |
| **`npm run verify:fix`**    | 포맷팅 및 기본 린트 오류를 0-토큰 로컬 CPU로 자동 수정                            |
| **`npm run verify:watch`**  | 파일 저장 시 0.3초 만에 백그라운드 실시간 감시                                    |
| **`npm run plan:check`**    | `implementation_plan.md` 기획서 양식 및 모듈 영향도 폭발 반경 분석                |
| **`npm run verify:docker`** | Docker 컨테이너 환경에서 호스트 격리 무오염 최종 승인 빌드                        |
