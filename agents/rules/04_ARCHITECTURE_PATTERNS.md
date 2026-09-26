# Architecture Patterns, MVVM & Backend Standards

This document serves as the authoritative, modular rule specification for application architecture, Next.js App Router patterns, MVVM state flows, DTO mappers, and backend services within Next.js + PostgreSQL enterprise projects.

---

## 🏗️ 1. Next.js App Router Architecture

### 1.1 RSC First
- Default components to **React Server Components (RSC)**.
- Client components (`"use client"`) are strictly restricted to interactive leaves.

### 1.2 Layered Directory Structure
- Server Actions: `src/actions/` (thin controller pattern: session validation, Zod parsing, delegate to services).
- Business Logic: `src/services/server/` (encapsulated service classes with dependency injection).
- Custom Hooks: `src/hooks/usecases/` (MVVM ViewModels encapsulating complex client state).
- UI Primitives: `src/components/ui/` (reusable atomic primitives).
- Prisma Select Catalog: `src/lib/prisma-selects/` (centralized DTO definitions).

### 1.3 Modular Component Decomposition
- Keep views strictly modularized by functional responsibility (in-page headers, KPI cards, filter grids, data tables, modals).
- Never flatten separated sub-components into a single parent file.

---

## 🔄 2. MVVM + Single ViewData Architecture (Client Components)

### 2.1 Principle & Data Flow
- Complex client components must use a Custom Hook as a **ViewModel** and a single read-only object as **ViewData** (Single Source of Truth).
- The ViewModel encapsulates state in a single integrated `useState` object for atomic updates.
- The ViewModel exposes:
  1. A single read-only `viewData` object.
  2. A separate, **stably cached** `actions` object containing event handler callbacks.
- The View renders solely based on `viewData` properties and triggers operations through `actions`.

### 2.2 Rendering Optimization
- Sub-property updates preserve reference equality of unchanged slices via shallow copy spreads (`...prev`).
- All `actions` callbacks use functional state updates (`setState(prev => ...)`) to maintain an empty dependency array (`[]`).
- Wrap downstream sub-components in `React.memo` to skip unnecessary re-renders.

### 2.3 Async Request Cancellation & Race Condition Prevention
- When tab switches, instant filters, or item selections trigger asynchronous Server Actions:
  - Maintain an incrementing request counter ref: `requestIdRef = useRef(0)`.
  - Increment `requestIdRef.current++` synchronously upon every trigger.
  - In `finally`/`then` blocks, verify: `if (currentRequestId !== requestIdRef.current) return;`.

---

## 📦 3. Mapper-Based DTO Design & Prisma.validator Catalog

### 3.1 DTO Isolation
- Application layers (Actions, UI, Services) must NEVER depend directly on raw Prisma database entities or external API payloads.
- Data Flow: $\text{Data Source (DB/API)} \longrightarrow \text{Mapper} \longrightarrow \text{DTO (Strict Interface)} \longrightarrow \text{Application}$

### 3.2 Prisma.validator Catalog (`src/lib/prisma-selects/`)
- Define reusable DTO `select` constants wrapped with `Prisma.validator<Prisma.ModelSelect>()({ ... })` under `src/lib/prisma-selects/`.
- Re-export via `src/lib/prisma-selects/index.ts`.
- Derive payload types with `Prisma.ModelGetPayload<{ select: typeof MODEL_DTO_SELECT }>`.
- DB Mappers must accept entity arguments typed with this derived payload type.

---

## 🧩 4. Service Layer Separation & Event-Driven Architecture

### 4.1 Dependency Injection
- Server Actions delegate all business logic to Service classes under `src/services/server/`.
- Do not import static Prisma singletons inside services. Inject required clients or repositories via constructor/factory arguments for testability.

### 4.2 Observer Pattern (`EventDispatcher`)
- Decouple secondary side-effects (audit logs, cache revalidations, notifications) from core use cases using `EventDispatcher` (`src/lib/event-dispatcher.ts`).
- Usecases only emit typed domain events (`await eventDispatcher.dispatch("DomainEvent", payload)`).
- All event listeners run in isolated `try-catch` blocks so side-effect failures never abort primary business transactions.

---

## 🚨 5. Error Handling & Token Optimization

- **No Dummy Data:** Never bypass features with mock/dummy data in production paths.
- **Error Loop Gate:** Pause execution after **5 consecutive occurrences** of the same error. Summarize status and request user guidance.
- **Context Diet:** Keep files modular (<300 lines recommended). Proactively split monolithic components.
- **Minimal Diffs:** Modify only targeted blocks using precise replacement tools. Avoid full-file rewrites.
- **Zero-Token Local Pre-Fix:** Run `npm run verify:fix` locally before requesting LLM intervention for formatting/linting errors.
