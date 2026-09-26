# Planning & PR History Specifications

This document serves as the authoritative, modular rule specification for planning lifecycles, PR-based implementation plan history, and architectural documentation.

---

## 📋 1. Interactive Pre-Execution & Planning Lifecycle

### 1.1 Discussion & Alignment First
- Always converse, align on user intent, and present architecture options before proposing implementation plans.
- Proactively clarify ambiguous requirements, edge cases, and performance constraints.

### 1.2 Iterative Plan Refinement Before Execution (No Number Increment)
- Before implementation officially begins, interaction is an iterative refinement and supplementation stage.
- Continuously update and supplement the *current* Plan document (e.g., Plan N) rather than incrementing plan numbers for every round of conversational feedback.
- Plan numbers increment sequentially (`Plan 1`, `Plan 2`, `Plan 3`...) ONLY when starting a new distinct requirement or milestone after previous work has completed.

### 1.3 Mandatory Planning Gate (`npm run plan:check`)
- Whenever drafting or iteratively refining an implementation plan, run `npm run plan:check`.
- Verify that both **Functional Specification (기능 명세서)** and **Technical Implementation Plan (구현 계획서)** sections are clearly delineated, scoring a perfect 100/100 points before presenting the plan for approval.

### 1.4 Strict Execution Trigger ("작업을 시작해줘")
- The agent must NOT create feature branches, touch source code, or execute implementation until the user explicitly gives the start command:
  - **"작업을 시작해줘"** (or explicit instructions to proceed).

---

## 📜 2. PR-Based Implementation Plan History Protocol

### 2.1 Single Authoritative PR Document
- Implementation plans strictly operate on a per-PR lifecycle.
- All iterative requirements, user feedback, and architectural adjustments within that PR MUST be continuously accumulated in a single authoritative document:
  - `docs/implementation_plan/YYYY-MM-DD_PR_{ID}.md` (following `docs/implementation_plan/TEMPLATE.md`).
- Creating separate new files for ongoing revisions within the same PR is strictly forbidden.

### 2.2 Standard Plan Block Structure
Whenever new requirements or constraints are introduced, append full standardized plan blocks labeled sequentially (`# [Plan 1]`, `# [Plan 2]`, `# [Plan 3]`...):
1. **Plan Title & Overview**
2. **`## User Review Required`** (with GitHub alert callouts: `> [!NOTE]`, `> [!IMPORTANT]`, `> [!CAUTION]`)
3. **`## 1. Functional Specification (기능 명세서)`** (Background, User Impact, Detailed Functional Changes)
4. **`## 2. Technical Implementation Plan (기술 구현 계획서)`** (Proposed Changes categorized by layer/component, explicit code diffs, file links)
5. **`## Verification Plan`** (Automated Tests, Harness Steps, Manual Verification Checklist)

### 2.3 Single In-Progress Rule & Dual Mirroring
- **Single In-Progress Rule**: Exactly ONE plan block may be `[In Progress]`; all previous plan blocks in the document MUST be marked `[Completed]`.
- **Dual Mirroring**: Concurrently mirror the active plan to the IDE artifact (`<appDataDir>/brain/<conversation-id>/implementation_plan.md`) for real-time developer context and planning harness analysis (`npm run plan:check`).
- Root `implementation_plan.md` in the workspace root is forbidden to prevent clutter.
