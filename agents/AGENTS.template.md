# AI Agent Development Guidelines (System Instructions)

This document serves as the **Single Source of Truth** for AI agent behaviors, coding standards, and workflows. Follow all instructions strictly to guarantee system stability and architectural consistency.

---

## 🎯 [1. Critical Rules & Guardrails]

| Category                          | Instruction / Rule                                                                                                                                                                                                                                                                                                | Violation Penalty       |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| **Language**                      | User communications & commits must be in **Korean**. `AGENTS.md` modifications must be **English only**.                                                                                                                                                                                                          | Critical Failure        |
| **Single Source**                 | Always refer to `README.md` and comprehensively analyze linked/referenced docs in `docs/` before making modifications.                                                                                                                                                                                            | Desync                  |
| **Workflow**                      | Always write an `implementation_plan.md` that strictly cross-checks and aligns with all `AGENTS.md` rules and standards, containing clearly separated **Functional Specification (기능 명세서)** and **Implementation Plan (구현 계획서)** sections within the document, and obtain approval before code changes. | Blocked                 |
| **Branching**                     | Commit ONLY to feature branches (`feature/...`). Create PR targeting `main` (`--base main`) immediately. Targeting `develop` is strictly prohibited.                                                                                                                                                              | Branch Violation        |
| **Commit Prefix**                 | Adhere to Conventional Commits format (e.g., `feat:`, `fix:`, `refactor:`, `chore:`) followed by Korean description.                                                                                                                                                                                              | Format Rejection        |
| **Types**                         | Strictly forbid the `any` type in TypeScript. Ensure 100% strict type safety.                                                                                                                                                                                                                                     | Lint Failure            |
| **Type Checking**                 | Always run `npx tsc --noEmit` at the final verification stage of EVERY task before committing to ensure 0 compile/type errors.                                                                                                                                                                                    | Build Failure           |
| **Formatting**                    | Always run `npm run format` and verify with `npm run format:check` at the final stage of every task before committing to ensure 100% Prettier compliance.                                                                                                                                                         | Formatting Desync       |
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
| **Mandatory Pre-Commit Pipeline** | Run `npm run verify` (or `npm run verify:full`) to execute the unified full-lifecycle harness pipeline (Type Check, Format, AST Guardrails, Tests, Build).                                                                                                                                                        | Gate Rejection          |

---

## 🏗️ [2. Architectural Design & Coding Standards]

### Next.js App Router Standards

- **RSC First:** Default components to **React Server Components (RSC)**. Client components (`"use client"`) are restricted to interactive leaves.
- **State Isolation:** Place Server Actions in `src/actions/` and complex client-side interactions in custom hooks under `src/hooks/usecases/`.
- **Component Reuse:** Prioritize custom UI components in `src/components/ui/` (`Button`, `Input`, `Card`, `Badge`, `Select`, `Table`, `Pagination`, `CommonModal`, `Typography`).
- **Shared Module Protection:** Minimize direct modifications to shared UI components or core utilities. Always prefer configuring props or adjusting caller components.
- **Modular Component Decomposition:** Keep UI views strictly modularized by functional responsibility (in-page headers, KPI cards, filter grids, data tables, modals). Never flatten separated sub-components into a single parent file.

### MVVM + Single ViewData Architecture (Client Component Standard)

- **Principle**: Client components with complex state management, form inputs, or Server Action interactions must use a Custom Hook as a **ViewModel** and a single read-only object as **ViewData** (Single Source of Truth).
- **Data Flow**:
  - The Custom Hook (ViewModel) encapsulates internal state using a single integrated `useState` object to ensure atomic updates.
  - The ViewModel exposes a single, read-only `viewData` object and a separate, **stably cached** `actions` object containing event handler callbacks.
  - The View (React Component) renders itself solely based on properties of `viewData` and triggers events through `actions`.
- **Rendering Optimization**:
  - Updating a sub-property in the integrated state must preserve references of other unchanged sub-properties using shallow copy spreads (`...prev`).
  - All callbacks inside `actions` must use functional state updates (`setState(prev => ...)`) to eliminate external dependencies, maintaining an empty dependency array (`[]`).
  - Wrap downstream sub-components in `React.memo` to skip rendering when their passed `viewData` slices and `actions` references do not change.
- **Standards Reference**: See `docs/STANDARDS_MVVM.md` for comprehensive code patterns.

### Async Request Cancellation & Race Condition Prevention

- Whenever switching tabs, applying instant search filters, or selecting items triggers asynchronous Server Actions, previous in-flight requests MUST be invalidated to prevent race conditions.
- **Request ID Tracking (`useRef<number>`)**: Maintain an incrementing request counter ref (`requestIdRef = useRef(0)`). Increment `requestIdRef.current++` synchronously upon every tab/filter change.
- **Stale Response Invalidation**: Before updating state in `finally`/`then` blocks, verify that the response belongs to the active request: `if (currentRequestId !== requestIdRef.current) return;`.

### Mapper-Based DTO Design & Prisma.validator Catalog

- **Principle:** Application layers (Actions, UI, Services) must NEVER depend directly on raw database entities (Prisma) or external API responses.
- **Data Flow:** $\text{Data Source (DB/API)} \longrightarrow \text{Mapper} \longrightarrow \text{DTO (Strict Interface)} \longrightarrow \text{Application}$
- **Prisma.validator Central Catalog (`src/lib/prisma-selects/`):**
  - Define reusable DTO `select` constants wrapped with `Prisma.validator<Prisma.ModelSelect>()({ ... })` under `src/lib/prisma-selects/` (e.g., `user.select.ts`).
  - Re-export via `src/lib/prisma-selects/index.ts`.
  - Derive payload types using `Prisma.UserGetPayload<{ select: typeof USER_DTO_SELECT }>`.
  - DB Mappers must accept entity arguments typed with this derived payload type.

### Service Layer Separation & Dependency Injection

- **Thin Controller Pattern:** Server Actions (`src/actions/`) must only validate sessions, parse inputs via Zod, and delegate to Services.
- **Service Encapsulation:** Core business logic and database transactions belong in Service classes under `src/services/server/`.
- **Dependency Injection (DI):** Do not import Prisma singletons statically inside services. Pass required clients or repositories via constructor or factory arguments for easy mocking and unit testing.

### Observer / Event-Driven Architecture (`EventDispatcher`)

- Decouple secondary side-effects (audit logs, cache revalidations, notifications) from core Usecases using `EventDispatcher` (`src/lib/event-dispatcher.ts`).
- Usecases only emit typed domain events (`await eventDispatcher.dispatch("UserRegistered", { userId })`).
- All event listeners are executed in isolated `try-catch` blocks so side-effect failures never abort the primary business transaction.

---

## 💾 [3. Database & Performance Optimization]

- **N+1 Prevention:** Optimize PostgreSQL/Prisma relations using `include` or explicit `select`. Use transactions (`prisma.$transaction`) for multi-step mutations.
- **Lightweight Projections:** Select only required fields. Never query whole tables when specific columns suffice.
- **Fuzzy Search:** At database level, utilize PostgreSQL `pg_trgm` similarity matching with fallback to `contains`.

---

## 🚨 [4. Error Handling & Git Workflows]

- **No Dummy Data:** Never bypass features with mock/dummy data in production paths.
- **Error Loop Gate:** Pause execution after **5 consecutive occurrences** of the same error. Summarize status and request user guidance.
- **Git Branching:** Commit only to `feature/...` branches branched directly from `main`. All PRs must target `main` (`gh pr create --base main`).
- **PR Title & Body:** Conventional Commits title. Body in Korean with Overview, Implementation Plan Full Text, Key Changes, and Verification Checklist. Refer to `docs/PR_EXAMPLE.md`.

---

## 🤖 [5. AI Agent Token Optimization & Context Management]

- **Context Diet:** Keep files focused and modular (<300 lines recommended). Proactively split monolithic components.
- **Minimal Diffs:** Modify only targeted blocks using precise replacement tools. Avoid full-file rewrites.
- **Zero-Token Local Pre-Fix:** Run `npm run verify:fix` and `npm run format` locally before requesting LLM intervention for lint/formatting errors.
- **Diagnostics Compression:** Consume `.harness/diagnostics.json` instead of pasting thousands of lines of raw build logs.
