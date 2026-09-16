# 🛠️ 코어 유틸리티 & 헬퍼 표준 가이드 (Core Utilities Guide)

본 문서는 프로젝트 전역에서 사용되는 **표준 코어 유틸리티 및 헬퍼 함수들의 단일 진실 공급원(SSOT)**입니다.  
새로운 기능을 개발하거나 리팩토링할 때, 인라인 중복 로직(ad-hoc helpers)을 직접 작성하지 않고 반드시 `@/lib/utils` 표준 유틸리티를 최우선으로 재사용해야 합니다.

---

## 📌 1. 표준 유틸리티 카탈로그 (Core Utilities Catalog)

### A. 통화·숫자·일시 포매터 (`src/lib/utils/format-utils.ts`)

| 함수명               | 시그니처                                                | 용도 및 핵심 규칙                                        | 반환 예시            |
| :------------------- | :------------------------------------------------------ | :------------------------------------------------------- | :------------------- |
| **`formatCurrency`** | `(amount?: number \| null, currency = "KRW") => string` | 통화 금액 포매터. `null`/`NaN` 방어 및 천 단위 콤마 표기 | `₩ 1,500`, `$ 12.50` |
| **`formatNumber`**   | `(val?: number \| null, fallback = "0") => string`      | 일반 숫자 천 단위 구분 쉼표 포매터                       | `1,234`, `0`         |
| **`formatPercent`**  | `(val?: number \| null, digits = 1) => string`          | 백분율 소수점 반올림 포매터                              | `15.4%`, `-`         |
| **`formatDateTime`** | `(date?: Date \| string \| number \| null) => string`   | Next.js Hydration Mismatch 없는 표준 일시 포매터         | `2026-09-17 14:30`   |

### B. 안전한 수치 파서 (Safe Numeric Parsers)

| 함수명                 | 시그니처                                 | 용도 및 핵심 규칙                                                               |
| :--------------------- | :--------------------------------------- | :------------------------------------------------------------------------------ |
| **`parseNumberSafe`**  | `(val: unknown, fallback = 0) => number` | 쉼표가 포함된 문자열(`"1,500"`), `null`, `undefined`를 안전하게 `number`로 변환 |
| **`parseIntegerSafe`** | `(val: unknown, fallback = 0) => number` | 정수 변환 및 소수점 절삭, 안전 Fallback 반환                                    |

### C. 클립보드 복사 유틸리티 & 훅

- **`copyToClipboard(text: string): Promise<boolean>`**: 브라우저 `navigator.clipboard.writeText`를 안전하게 래핑한 비동기 복사 함수.
- **`useClipboardCopy()`**: 컴포넌트 내에서 복사 후 "복사됨!" 툴팁이나 상태를 2초간 유지하고 타이머를 자동 클린업하는 커스텀 훅.

### D. 파일 및 데이터 다운로드

- **`downloadBlob(blob: Blob, filename: string): void`**: 메모리 상의 Blob 객체를 브라우저에서 파일로 즉시 다운로드하고, `URL.revokeObjectURL`을 호출하여 메모리 누수를 방지합니다.
- **`downloadText(content: string, filename: string): void`**: 텍스트나 CSV 문자열을 지정된 파일명으로 다운로드합니다.

---

## ❌ Anti-Pattern vs ✅ Recommended Pattern

```typescript
// ❌ Anti-Pattern: 인라인 중복 코드 및 Hydration 에러 유발
<span>{amount ? amount.toLocaleString() : "0"}</span> // null 방어 누락 위험
<span>{new Date().toLocaleString()}</span>           // 서버와 클라이언트의 로케일 차이로 Hydration Crash!
const parsed = parseFloat(inputVal.replace(/,/g, "")); // NaN 처리 부재

// ✅ Recommended Pattern: 표준 유틸리티 재사용
import { formatCurrency, formatDateTime, parseNumberSafe } from "@/lib/utils";

<span>{formatCurrency(amount)}</span>
<span>{formatDateTime(createdAt)}</span>
const parsed = parseNumberSafe(inputVal, 0);
```
