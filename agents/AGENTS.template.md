# AI Agent Development Guidelines (System Instructions)

This document serves as the **Single Source of Truth** for AI agent behaviors, coding standards, and workflows. Follow all instructions strictly to guarantee system stability and architectural consistency.

---

## 🎯 [1. Critical Rules & Guardrails]

| Category                          | Instruction / Rule                                                                                                                                                                                                                                                                                                | Violation Penalty       |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| **Language**                      | User communications & commits must be in **Korean**. `AGENTS.md` modifications must be **English only**.                                                                                                                                                                                                          | Critical Failure        |
| **Single Source**                 | Always refer to `README.md` and comprehensively analyze linked/referenced docs in `docs/` before making modifications.                                                                                                                                                                                            | Desync                  |
| **Workflow & Start Gate**         | Always engage in interactive discussion and planning FIRST. Every plan document must follow `docs/implementation_plan/TEMPLATE.md` with clearly separated **Functional Specification (기능 명세서)** and **Implementation Plan (구현 계획서)**, verified by `npm run plan:check`. Transition to execution only upon explicit directive (e.g., **"작업을 시작해줘"**). Pull Requests must be created ONLY when user explicitly requests PR creation (e.g., **"PR 만들어줘"**). | Blocked                 |
| **PR Plan History**               | Implementation plans operate on a per-PR basis. All iterative requirements MUST be accumulated within (`docs/implementation_plan/YYYY-MM-DD_PR_{ID}.md`) as sequential `Plan 1, 2, 3...` blocks and committed to git. Concurrently mirror active plan to IDE artifact (`<appDataDir>/brain/<conversation-id>/implementation_plan.md`). Root `implementation_plan.md` is strictly forbidden. | Spec Violation          |
| **Branching & PR Timing**         | Commit ONLY to feature branches (`feature/...`) branched directly from `main`. Targeting `develop` is strictly prohibited. Create PR targeting `main` (`--base main`) ONLY at the very end when explicitly requested by user.                                                                                                   | Branch Violation        |
| **Commit Prefix**                 | Adhere to Conventional Commits format (e.g., `feat:`, `fix:`, `refactor:`, `chore:`) followed by Korean description.                                                                                                                                                                                              | Format Rejection        |
| **Types**                         | Strictly forbid the `any` type in TypeScript. Ensure 100% strict type safety.                                                                                                                                                                                                                                     | Lint Failure            |
| **Intermediate Dev Harness**      | During development iterations, use `npm run verify:types` for rapid type checking and `npm run verify:fix` for zero-token local CPU automated Prettier/ESLint fixing.                                                                                                                                             | Harness Desync          |
| **Mandatory Pre-Commit Pipeline** | Run `npm run verify` (or `npm run verify:full`) to execute the unified full-lifecycle harness pipeline (Type Check ➔ Prettier Format ➔ AST & Lint Guardrails + AGENTS Size Check ➔ Vitest Tests ➔ Next.js Build). Every task must pass 100% with 0 errors before committing. Inspect `.harness/diagnostics.json` for pruned failure context. | Gate Rejection          |
| **Docs**                          | Record commit details in daily update log (`docs/logs/updates/update-YYYY-MM-DD.md`) and keep root `docs/UPDATE_LOG.md` index in sync. Avoid editing `README.md` log.                                                                                                                                             | Desync                  |
| **Core Utilities**                | Always inspect and reuse standard utilities from `@/lib/utils` first. Ad-hoc duplication forbidden.                                                                                                                                                                                                               | Code Rejection          |
| **Common UI Primitives**          | Always inspect and reuse atomic primitives under `@/components/ui` first. Ad-hoc raw HTML duplication forbidden.                                                                                                                                                                                                  | Code Rejection          |
| **Shared Modules**                | Strictly minimize modifications to shared UI components or common utilities. Prefer adapting caller configurations.                                                                                                                                                                                               | Side Effect Risk        |
| **Direct File Editing**           | Strictly forbid arbitrary `node -e` or ad-hoc scripts solely to create/modify workspace files. Always use dedicated file tools (`write_to_file`, `replace_file_content`).                                                                                                                                         | Script Violation        |
| **Design Specs Ground Truth**     | Strictly forbid reverse-engineering or hallucinating specs from Stitch AI mockups or speculative prompts. Specs under `docs/designs/` must 100% trace to real React/TypeScript code (`src/...`) line-by-line.                                                                                                     | Hallucination Violation |
| **Comprehensive Page Coverage**   | Whenever reviewing/redesigning a screen, the agent MUST fully cover all tabs, sub-tabs, and triggerable modals with 1:1 living specs, 1:1 capture scenarios, and Stitch targets.                                                                                                                                  | Coverage Violation      |
| **3-Pillar Hybrid Context**       | For all Stitch operations, assemble (1) Base Screen Screenshot, (2) Domain Markdown Spec, and (3) Sanitized Component JSX Skeleton (markup & Tailwind only, logic stripped) to prevent hallucination.                                                                                                             | Context Violation       |
| **Loading State Safeguard**       | Base Screen captures MUST ensure all asynchronous data fetching has settled via `waitForDataReady` (`networkidle`, detachment of spinners/skeletons, real table row rendering). Capturing spinners/skeletons forbidden.                                                                                           | Capture Violation       |
| **Harness Living Documentation**  | Whenever adding, enhancing, or creating a verification harness, the agent MUST immediately document it under `docs/harness/` and update `docs/HARNESS_MASTER_GUIDE.md`.                                                                                                                                           | Doc Desync              |
| **System Alerts & Truncation**    | Proactively detect and alert the user immediately whenever system runtime warnings, context truncations (`<truncated ... bytes>`), tool execution errors, or sandbox permissions block operations. Silent omission or proceeding without notifying user is strictly forbidden.                                       | Silent Failure          |
| **Rule Router Dispatch**          | Whenever executing specialized domain tasks (UI/Stitch, PR planning, verification, architecture), the agent MUST read and adhere to the corresponding rule module in `docs/rules/`.                                                                                                                              | Spec Violation          |
| **Dual-Track Pipeline Triage**    | Default to automated dual-track routing (Lightweight vs Full Multi-Agent) based on blast radius and risk. Honor explicit user overrides immediately.                                                                                                                                                              | Token Waste             |
| **AGENTS.md Size Budget**         | Strictly keep `AGENTS.md` under 28KB (hard ceiling 40KB). Run `npm run check:agents` on every rule modification. Exceeding 40KB blocks PR verification to prevent system prompt truncation.                                                                                                                       | Size Rejection          |

---

## 🧭 [2. Modular Rule Directory (On-Demand Dispatch)]

To prevent prompt context bloat and ensure zero-truncation, specialized protocols are modularized under `docs/rules/`. Before performing domain-specific tasks, consult the authoritative guide:

| Task / Domain                     | Authoritative Rule Module                                                                                                                     | Required Action                                                                                                         |
| :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **UI, Stitch Redesign & Specs**   | [`docs/rules/01_STITCH_AND_DESIGN_SPECS.md`](file:///absolute/path/to/docs/rules/01_STITCH_AND_DESIGN_SPECS.md)                               | Enforce 3-Pillar Hybrid Context, code-first ground truth, zero-spinner captures, and modal/sub-tab scope isolation.     |
| **Planning & PR History**         | [`docs/rules/02_PLANNING_AND_PR_HISTORY.md`](file:///absolute/path/to/docs/rules/02_PLANNING_AND_PR_HISTORY.md)                               | Enforce PR-scoped cumulative plan history, Single In-Progress rule, and artifact mirroring.                            |
| **Harness Gates & Verification**  | [`docs/rules/03_HARNESS_AND_VERIFICATION.md`](file:///absolute/path/to/docs/rules/03_HARNESS_AND_VERIFICATION.md)                             | Execute 3-stage 5-gate quality pipeline, AI diagnostics pruning (`.harness/diagnostics.json`), and living docs sync.     |
| **Architecture, MVVM & Backend**  | [`docs/rules/04_ARCHITECTURE_PATTERNS.md`](file:///absolute/path/to/docs/rules/04_ARCHITECTURE_PATTERNS.md)                                   | Enforce RSC first, MVVM Single ViewData, Async request cancellation, Mapper DTOs, Observer pattern, and caching tiers. |
| **Multi-Agent Pipeline & Triage** | [`docs/MULTI_AGENT_PIPELINE_GUIDE.md`](file:///absolute/path/to/docs/MULTI_AGENT_PIPELINE_GUIDE.md)                                           | Route between Lightweight Track (Coder + Reviewer) and Full 5-Phase Multi-Agent Team automatically or via override.     |

---

## 🤖 [3. Dual-Track Multi-Agent Execution Protocol]

To optimize token efficiency and prevent unnecessary overhead, the agent operates in dual-track execution mode:

1. **Automated Triage (Default)**:
   - **Lightweight Track**: Triggered automatically for low-impact changes (typos, CSS styles, single-file leaf bug fixes, localized copy). Uses isolated single Coder + Reviewer (5-Gate Harness). Bypasses Discovery & Test Architect phases.
   - **Full Multi-Agent Track**: Triggered automatically for high-risk changes (Prisma schema, financial calculations, 3rd-party API integrations, security/auth). Deploys full 5-phase team (Phase 1: PO + Tech + UX + Red-Team -> Phase 2: Planner -> Phase 3: Test Architect TDD -> Phase 4: Isolated Coder -> Phase 5: QA Tester & 5-Gate Reviewer).
2. **Explicit Manual Override**:
   - The user may explicitly request lightweight execution ("경량 모드로 해줘", "빠르게 수정해줘") or full multi-agent orchestration ("에이전트 풀팀으로 해줘", "기획/테스트팀 다 투입해줘").
   - Explicit user requests supersede automatic triage unconditionally.
3. **Proactive Track Announcement (Per User Prompt)**:
   - The agent MUST explicitly display the active pipeline track badge ONCE at the very beginning of the response to each user prompt/message.
   - Do NOT repeat or duplicate the badge inside intermediate tool execution steps, sub-action progress logs, or background task notifications within that turn:
     - Lightweight: `> ⚡ **[Pipeline Track: Lightweight Fast-Track]** (Rationale: Low blast radius / single-file leaf change / explicit user override)`
     - Full Multi-Agent: `> 🏛️ **[Pipeline Track: Full Multi-Agent Team]** (Rationale: High risk / Prisma schema / financial transaction / external API / explicit user override)`

---

## 🚨 [4. Proactive System Alerts & Context Integrity Protocol]

The agent MUST actively monitor runtime system states and prompt context integrity:

1. **Zero Silent Failure**: Whenever system-level anomalies occur—including instruction or context truncation tags (`<truncated ... bytes>`), model token overflows, unhandled tool errors, or sandbox permissions block operations. Silent omission or proceeding without notifying the user is strictly forbidden.
2. **Context Integrity Check**: Never assume missing rules when truncation occurs. Immediately request clarification or read the un-truncated authoritative documents from disk.

---

## 🌿 [5. Git Workflow & Commit Conventions]

1. **Branch Strategy**:
   - Always branch off `main`: `git checkout -b feature/<feature-name>`.
   - Never push directly to `main` or `develop`.
   - Create PR targeting `main` (`gh pr create --base main`) ONLY at the very end when explicitly requested by user.
2. **Conventional Commits (Korean)**:
   - `feat: 새로운 기능 추가`
   - `fix: 버그 수정`
   - `refactor: 코드 리팩토링 (기능 변경 없음)`
   - `docs: 문서 수정`
   - `test: 테스트 코드 추가 및 수정`
   - `chore: 빌드, 패키지 매니저 설정 등 기타 작업`
