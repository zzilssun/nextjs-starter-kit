# [PR #{ID}] <PR Title or Feature System Name>

- **관련 PR**: [PR #{ID}](https://github.com/{owner}/{repo}/pull/{ID})
- **작업 브랜치**: `feature/...`
- **대상 베이스**: `main`

---

# [Plan 1] [Completed] <Plan 1 Title>

<Brief 1-2 sentence description of what this plan accomplishes and its core purpose.>

---

## User Review Required

> [!NOTE] <!-- or [!IMPORTANT] / [!WARNING] -->
> **<Review Item Title>**:
> <Key architectural decisions, critical scope, or items requiring user awareness/approval.>

---

## 1. Functional Specification (기능 명세서)

### 1.1 배경 및 목적

1. **<Background / Problem Statement>**:
   - <Detailed explanation of existing issues or business needs.>

### 1.2 기능 변경 상세

1. **<Detailed Feature Change / Business Logic>**:
   - <Step-by-step business rules, UI state changes, or API specifications.>

---

## 2. Technical Implementation Plan (기술 구현 계획서)

### Proposed Changes

#### <Component / Module / Layer Name>

#### [MODIFY] [filename.tsx](file:///absolute/path/to/src/...)

- <Summary of code changes, state management, or prop updates.>

```tsx
// Code snippet or diff representation
```

#### [NEW] [filename.ts](file:///absolute/path/to/src/...)

- <Summary of newly created service, usecase, or UI component.>

---

## Verification Plan

### Automated Tests

1. **타입 및 린트 검증**:
   - `npx tsc --noEmit`
   - `npm run format:check`
2. **단위 테스트**:
   - `npm test`
3. **전주기 하네스 검증**:
   - `npm run verify`

### Manual Verification

- <Step-by-step manual testing instructions via browser or UI.>

---

# [Plan 2] [Completed] <Plan 2 Title (Added upon iterative user feedback)>

<Brief 1-2 sentence description of what this follow-up plan accomplishes.>

---

## User Review Required

> [!NOTE]
> ...

---

## 1. Functional Specification (기능 명세서)

### 1.1 배경 및 목적

...

### 1.2 기능 변경 상세

...

---

## 2. Technical Implementation Plan (기술 구현 계획서)

### Proposed Changes

...

---

## Verification Plan

### Automated Tests

...

### Manual Verification

...
