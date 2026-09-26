# Stitch Redesign & UI/UX Design System Specifications

This document serves as the authoritative, modular rule specification for Stitch redesigns, living design specifications, and UI/UX standards within Next.js + PostgreSQL enterprise projects.

---

## 🎨 1. Stitch AI & Design System Protocol

### 1.1 Design Specs Ground Truth (Code-First)
- **Strict Prohibition**: Strictly forbid reverse-engineering or hallucinating specs from Stitch AI mockups or speculative prompts.
- **Traceability**: All living specifications under `docs/designs/` or design guidelines must 100% trace to real React/TypeScript code (`src/...`) line-by-line.
- **Single Source of Truth**: Production React components (`src/components/`, `src/app/`) define the living truth. Stitch mockups serve as visual inspirations and layout drafts, not authoritative logic or styling invariants.

### 1.2 Comprehensive Page & Modal Coverage
- Whenever reviewing or redesigning a screen, the agent MUST fully enumerate and cover:
  1. All main views and tabs.
  2. Sub-tabs, conditional sections, and toggles.
  3. 100% of triggerable modals, dialogs, drawers, and confirmation popups.
- Maintain 1:1 living specs, 1:1 capture scenarios (`scripts/scenarios/` or `stitch/scenarios/`), and dedicated Stitch redesign targets.

### 1.3 3-Pillar Hybrid Context
When generating or adopting Stitch UI into the project, always assemble the 3 pillars to prevent hallucination:
1. **Base Screen Screenshot**: Real screenshot captured from local browser without spinners or skeletons.
2. **Domain Markdown Spec**: Business logic, validation rules, data states, and interactive element specifications.
3. **Sanitized Component JSX Skeleton**: Real markup and Tailwind CSS layout with business logic and state hooks stripped (`scripts/stitch-skeleton.ts`).

### 1.4 Loading State Safeguard
- Screenshots and captures MUST ensure all asynchronous data fetching has fully settled via `waitForDataReady`:
  - `networkidle` state reached.
  - Skeletons, spinners, and temporary placeholders completely detached.
  - Real table rows, cards, or empty state illustrations rendered.
- Capturing spinners or skeletons is strictly forbidden.

### 1.5 Modular Skin Transplant & Component Decomposition
- When adopting Stitch HTML into React:
  - Strictly preserve modular component file structures (headers, filter bars, tables, modal dialogs, status badges).
  - Never collapse or flatten separated sub-components into a single parent file.
  - Preserve atomic common UI primitives from `@/components/ui/` (`Button`, `Input`, `Card`, `Badge`, `Select`, `Table`, `CommonModal`, `Typography`).
