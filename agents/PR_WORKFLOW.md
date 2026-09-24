# 🎋 Git 브랜칭 및 풀 리퀘스트(PR) 표준 워크플로우

본 문서는 프로젝트의 Git 형상 관리, 브랜칭 전략, 커밋 메시지 컨벤션, 그리고 풀 리퀘스트(PR) 본문 작성 표준 가이드입니다.

---

## 📌 1. Git 브랜칭 전략 (Branching Strategy)

- **Main Trunk 전략**: 모든 기능 개발과 버그 수정은 `main` 브랜치를 기준으로 분기합니다.
- **브랜치 명명 규칙**:
  - 신규 기능: `feature/<기능명>` (예: `feature/user-auth`, `feature/order-dashboard`)
  - 버그 수정: `fix/<버그명>` (예: `fix/token-expiration-crash`)
  - 리팩토링: `refactor/<대상명>` (예: `refactor/mvvm-viewmodel`)
  - 인프라/설정: `chore/<작업명>` (예: `chore/docker-compose-update`)
- **타깃 베이스 규칙**:
  - 모든 PR은 반드시 `--base main`을 타깃으로 생성합니다. `develop` 브랜치를 베이스로 하는 PR은 금지됩니다.

---

## ✍️ 2. 커밋 메시지 컨벤션 (Conventional Commits)

커밋 메시지는 반드시 영문 접두사(Conventional Prefix)와 **한국어 설명**을 조합하여 작성합니다:

```text
<type>: <한국어 작업 요약 설명>
```

| 접두사 (Type)   | 용도 및 설명                    | 예시                                                           |
| :-------------- | :------------------------------ | :------------------------------------------------------------- |
| **`feat:`**     | 새로운 기능 추가                | `feat: 사용자 프로필 수정 MVVM 훅 및 UI 구현`                  |
| **`fix:`**      | 버그 수정                       | `fix: 날짜 필터 선택 시 레이스 컨디션 요청 무효화 처리`        |
| **`refactor:`** | 코드 구조 개선 (기능 변경 없음) | `refactor: Server Actions 비즈니스 로직 Service 계층으로 이관` |
| **`docs:`**     | 문서 추가 및 수정               | `docs: 공통 UI 버튼 컴포넌트 WAI-ARIA 규격 가이드 추가`        |
| **`style:`**    | 코드 포맷팅, 세미콜론 누락 등   | `style: Prettier 포맷팅 규칙 일괄 적용`                        |
| **`test:`**     | 테스트 코드 추가 또는 수정      | `test: 주문 수량 계산 로직 Vitest 단위 테스트 추가`            |
| **`chore:`**    | 빌드 스크립트, 패키지 의존성 등 | `chore: @google/stitch-sdk 최신 버전 의존성 업데이트`          |

---

## 📝 3. 풀 리퀘스트(PR) 작성 표준

모든 PR 본문은 다음 4대 필수 섹션을 포함하여 **한국어**로 명확히 작성합니다:

```markdown
## 1. 개요 (Overview)

- 작업 유형: [신규 기능 / 버그 수정 / 리팩토링 / 문서]
- 핵심 목적: 이번 작업이 해결하고자 하는 문제와 달성한 목표를 간결하게 기술합니다.

## 2. 사전 구현 계획서 (Implementation Plan Full Text)

> [!NOTE]
> 구현 계획서는 PR 단위로 관리되며, PR이 유지되는 한 하나의 문서(`docs/implementation_plan/YYYY-MM-DD_PR_{ID}.md`)에 모든 변경 요구사항이 누적(`Plan 1, Plan 2, Plan 3...`) 기록됩니다.
> 작업 전 작성 및 승인된 구현 계획서 전문을 생략/축약 없이 그대로 첨부하여 변경 이력과 기획 정합성을 100% 보존합니다.

(이곳에 docs/implementation_plan/YYYY-MM-DD_PR_{ID}.md 마크다운 전문 삽입)

## 3. 주요 변경 사항 (Key Changes)

- **통합 기능 단위 서술**: 개별 파일 목록을 단순 나열하지 않고, 응집도 높은 기능 단위로 무엇이 어떻게 변경되었는지 설명합니다.
  - 예: `MVVM 아키텍처 도입`: `useOrderViewModel` 훅을 통해 `viewData`와 불변 `actions`를 분리하고 `React.memo` 적용.
  - 예: `Prisma DTO Select 카탈로그`: `user.select.ts`를 신설하여 런타임 Null 에러 원천 차단.

## 4. 검증 결과 (Verification Checklist)

- [x] TypeScript Static Type Check (`npm run check:types` -> 0 errors)
- [x] Prettier Code Formatting (`npm run format:check` -> 100% compliant)
- [x] AST Architecture Guardrails (`npm run verify` -> 0 violations)
- [x] Vitest Unit Tests (`npm test` -> All passed)
- [x] Next.js Production Build (`npm run build` -> Passed)
```

---

## 🔄 4. PR 생성 및 업데이트 프로세스

1. **로컬 전주기 하네스 통과**: 커밋 전 `npm run verify`를 실행하여 6단계 게이트가 모두 통과하는지 확인합니다.
2. **일일 업데이트 로그 작성**: `docs/logs/updates/update-YYYY-MM-DD.md`에 변경 내역을 기록하고 `docs/UPDATE_LOG.md`를 동기화합니다.
3. **PR 존재 여부 확인**:

   ```bash
   gh pr list --head <현재브랜치명>
   ```

   - **기존 PR이 이미 존재하는 경우**: `gh pr edit`를 사용하여 기존 PR의 본문과 타이틀을 최신 구현 계획서 및 누적 로그로 업데이트합니다 (중복 PR 생성 금지).
   - **기존 PR이 없는 경우**: `gh pr create --base main`을 실행하여 신규 PR을 생성합니다.
