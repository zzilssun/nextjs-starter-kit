# Harness Gates & Quality Verification Specifications

This document serves as the authoritative, modular rule specification for verification harnesses, quality gates, and living documentation synchronization within Next.js + PostgreSQL enterprise projects.

---

## 🛡️ 1. 3-Stage Full-Lifecycle Harness Pipeline

Enterprise projects enforce a 3-stage, 5-gate full-lifecycle verification pipeline to achieve 0-token fail-fast defect prevention:

```
[ Stage 0: Planning Gate ]
  └─ npm run plan:check [-- path]
       • Functional Spec + Technical Implementation Plan separation audit (100/100 required)
       │ (User Approval: "작업을 시작해줘")
       ▼
[ Stage 1: Intermediate Dev Gates (Rapid Feedback) ]
  ├─ npm run verify:types : Single-step fast TypeScript type check (tsc --noEmit)
  └─ npm run verify:fix   : Local CPU 0-token automated Prettier & ESLint fix
       │ (Feature Implementation Completed)
       ▼
[ Stage 2: Mandatory Pre-Commit Gate (Unified Quality Pipeline) ]
  └─ npm run verify (or npm run verify:full)
       ├─ [Gate 1] TypeScript Static Type Check (tsc --noEmit)
       ├─ [Gate 2] Prettier Code Formatting Integrity (format:check)
       ├─ [Gate 3] Lint & AST Architecture Guardrails (AST check + ESLint + AGENTS size check)
       ├─ [Gate 4] Unit & Integration Tests (Vitest suite pass)
       └─ [Gate 5] Next.js Production Build (next build production bundle)
```

---

## 🔍 2. AI Diagnostics Compression (`.harness/diagnostics.json`)

- When build, type, or lint errors occur, raw terminal logs can span thousands of lines, consuming massive LLM context tokens.
- The harness automatically prunes logs into a structured `.harness/diagnostics.json` containing:
  - Top 3~5 critical failure entries.
  - File path, line number, error code, and essential failure message.
- The agent MUST consume `.harness/diagnostics.json` rather than demanding or pasting raw terminal logs.

---

## 📚 3. Harness Living Documentation Synchronization

Whenever adding, enhancing, or creating a verification harness:
1. Document the harness specification under `docs/harness/`.
2. Update the master index in `docs/HARNESS_MASTER_GUIDE.md`.
3. Provide both manual CLI invocation commands and automated AI agent review instructions.
