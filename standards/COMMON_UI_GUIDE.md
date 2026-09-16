# 🎨 공통 UI 컴포넌트 가이드 & 표준 (Common UI Component Standards)

본 문서는 `src/components/ui/` 디렉터리에 위치하는 **표준 공통 UI 컴포넌트(Shared UI Primitives)의 단일 진실 공급원(SSOT)**이자 컴포넌트 개발 지침입니다.

---

## 📌 1. 핵심 철학 (Design & Engineering Philosophy)

1. **원시 HTML 날코딩 금지 (No Ad-Hoc Raw HTML)**:
   - raw `<button>`, `<input>`, `<select>`, `<table>`을 화면 파일마다 임의 스타일로 반복 작성하는 것을 금지합니다. 반드시 `@/components/ui`에 정의된 표준 컴포넌트를 재사용해야 합니다.
2. **도메인 비종속성 (Domain Decoupling)**:
   - 공통 UI 컴포넌트 내부에서 백엔드 Server Action을 직접 import하거나 특정 비즈니스 도메인(주문, 결제, 특정 상점명 등)에 종속된 텍스트/아이콘을 하드코딩해서는 안 됩니다.
   - 모든 데이터와 핸들러는 Props(`title`, `onConfirm`, `isLoading`)를 통해 외부에서 주입받아야 합니다.
3. **고대비 가독성 & WAI-ARIA 웹 접근성**:
   - 인풋과 셀렉트는 브라우저 라이트/다크 모드 혼선으로 텍스트가 묻히지 않도록 `text-gray-900` 고대비 스타일을 내장합니다.
   - 모달은 WAI-ARIA 표준(`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)과 `ESC` 키 닫기 이벤트 리스너를 지원합니다.

---

## 🧭 2. 표준 공통 UI 컴포넌트 카탈로그 (7대 범주)

| 범주             | 대표 컴포넌트         | 핵심 기능 및 규격                                                                                                                                |
| :--------------- | :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. 폼 컨트롤** | **`Button`**          | 7종 브랜드 스타일(`primary`, `secondary`, `outline`, `ghost`, `destructive`, `success`, `warning`), 내장 회전 스피너(`isLoading`), 자동 비활성화 |
|                  | **`Input`**           | `text-gray-900` 고대비 보장, 숫자 인풋 마우스 휠 값 왜곡 방지(`disableWheelAdjustment`), `error` 테두리                                          |
|                  | **`Select`**          | 커스텀 SVG 화살표, 고대비, `options` 배열 또는 semantic `children` 지원                                                                          |
| **2. 서피스**    | **`Card`**            | Material Design 3 표준 카드 서피스 (`Card`, `CardHeader`, `CardTitle`, `CardContent`), `rounded-xl`, `border`, `shadow-sm`                       |
| **3. 피드백**    | **`Badge`**           | 8종 상태 뱃지 (`default`, `secondary`, `outline`, `destructive`, `success`, `warning`, `info`), `rounded-full`                                   |
| **4. 데이터 표** | **`Table`**           | 시맨틱 반응형 테이블 세트 (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`)                                                         |
|                  | **`Pagination`**      | 1/이전/다음/마지막 이동 + 페이지 직접 점프 입력 폼 내장, `React.memo` 최적화                                                                     |
| **5. 모달**      | **`CommonModal`**     | React Portal 기반 범용 다이얼로그, ESC 키 닫기, 백드롭 클릭 닫기, 스크롤 잠금                                                                    |
| **6. 지표**      | **`StatsCard`**       | 대시보드 KPI 카드, 클릭 링크 인터랙션, M3 `rounded-2xl` 서피스                                                                                   |
| **7. 날짜**      | **`DateRangePicker`** | 기간 선택기, 퀵 프리셋(오늘/최근 7일/최근 30일) 및 달력 뷰                                                                                       |

---

## ❌ Anti-Pattern vs ✅ Recommended Pattern

### 버튼 (Button)

```tsx
// ❌ Anti-Pattern: 인라인 Tailwind 날코딩 및 스피너 수동 조합 (스타일 불일치, 토큰 낭비)
<button
  type="button"
  disabled={isLoading}
  onClick={handleSubmit}
  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
>
  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
  저장
</button>;

// ✅ Recommended Pattern: 공통 Button 컴포넌트 재사용 (1줄 완성)
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="md" isLoading={isLoading} onClick={handleSubmit}>
  저장
</Button>;
```

### 입력창 (Input)

```tsx
// ❌ Anti-Pattern: raw <input> (고대비 스타일 누락, 휠 스크롤 시 값 변형 버그 위험)
<input
  type="number"
  value={amount}
  onChange={(e) => setAmount(Number(e.target.value))}
  className="border rounded p-2 text-sm"
/>;

// ✅ Recommended Pattern: 공통 Input 컴포넌트 사용 (고대비 및 휠 방어 내장)
import { Input } from "@/components/ui/Input";

<Input
  type="number"
  value={amount}
  onChange={(e) => setAmount(Number(e.target.value))}
  disableWheelAdjustment
/>;
```
