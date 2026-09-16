# 🎭 MVVM + Single ViewData 아키텍처 표준 (MVVM Architecture)

본 문서는 클라이언트 컴포넌트(`"use client"`)에서 복잡한 상태 관리와 사용자 인터랙션을 처리할 때 적용해야 하는 **MVVM (Model-View-ViewModel) + 단일 ViewData 구조** 표준 가이드입니다.

---

## 📌 1. 핵심 원칙 (Core Principles)

```
┌──────────────────────────────────────────────────────────┐
│                   MVVM DATA FLOW DIAGRAM                 │
└──────────────────────────────────────────────────────────┘

     [ View (React Component) ]
            │               ▲
   이벤트 트리거 (onClick)    │ viewData 읽기 전용 구독
            │               │
            ▼               │
     [ Actions (useMemo) ]  │
            │               │
      함수형 상태 업데이트     │
            │               │
            ▼               │
   [ State (단일 useState) ] ─┴─> [ viewData = state ]
     (ViewModel Custom Hook)
```

### 1. 단일 진실 공급원 (Single Source of Truth, SSOT)

ViewModel 내부의 모든 상태(필터, 입력 폼, 로딩 상태, 모달 열림 여부 등)는 개별 `useState`로 파편화하지 않고 **하나의 통합된 객체(`state`)**로 관리합니다. View 컴포넌트는 오직 이 상태에서 직접 파생된 읽기 전용 **`viewData`** 객체만 소비합니다.

### 2. 참조 무결성 보장 (Reference Integrity via Shallow Copy)

상태의 특정 하위 필드(예: `filter`)를 업데이트할 때, 변경되지 않은 다른 하위 필드(예: `tableData`, `modal`)는 반드시 얕은 복사(`...prev`)를 통해 이전 참조를 유지해야 합니다. 이를 통해 `React.memo`로 감싼 하위 컴포넌트의 불필요한 가상 DOM 리렌더링을 100% 방지합니다.

### 3. 안정적인 액션 객체 (Stable Actions with Zero Dependencies)

View 컴포넌트에 노출되는 이벤트 핸들러 모음인 **`actions` 객체는 빈 의존성 배열(`[]`)로 단 한 번만 생성**되어야 합니다. 핸들러 내부에서는 외부 상태를 클로저로 캡처하지 않고, 항상 함수형 업데이트(`setState(prev => ...)`)를 사용하여 안정적인 참조를 유지합니다.

---

## 💻 2. 실전 구현 예제 (Implementation Example)

### A. ViewModel 훅 (`useOrderListViewModel.ts`)

```typescript
import { useState, useMemo, useRef } from "react";

export interface OrderRowViewData {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "SHIPPED";
}

export interface OrderListViewData {
  filter: { search: string; status: string };
  orders: OrderRowViewData[];
  isLoading: boolean;
  selectedOrderId: string | null;
}

export interface OrderListActions {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSelectOrder: (id: string | null) => void;
  onRefresh: () => Promise<void>;
}

export function useOrderListViewModel(initialOrders: OrderRowViewData[]) {
  // 1. Single Source of Truth: 통합 상태 객체
  const [state, setState] = useState<OrderListViewData>({
    filter: { search: "", status: "ALL" },
    orders: initialOrders,
    isLoading: false,
    selectedOrderId: null,
  });

  // 레이스 컨디션 방어를 위한 요청 카운터 Ref
  const requestIdRef = useRef(0);

  // 2. ViewData: 단일 읽기 전용 상태
  const viewData = state;

  // 3. Actions: 의존성 배열 []로 단 한 번만 생성되는 안정적인 액션 모음
  const actions: OrderListActions = useMemo(
    () => ({
      onSearchChange: (search: string) => {
        setState((prev) => ({
          ...prev,
          filter: { ...prev.filter, search }, // orders, selectedOrderId 참조 유지
        }));
      },
      onStatusChange: (status: string) => {
        setState((prev) => ({
          ...prev,
          filter: { ...prev.filter, status },
        }));
      },
      onSelectOrder: (id: string | null) => {
        setState((prev) => ({
          ...prev,
          selectedOrderId: id,
        }));
      },
      onRefresh: async () => {
        const currentReqId = ++requestIdRef.current;
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
          // 비즈니스 API 호출
          // const newOrders = await fetchOrdersAction(state.filter);
          // if (currentReqId !== requestIdRef.current) return; // 레이스 컨디션 무효화
        } finally {
          if (currentReqId === requestIdRef.current) {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        }
      },
    }),
    []
  );

  return { viewData, actions };
}
```

### B. View 컴포넌트 (`OrderListClient.tsx`)

```tsx
"use client";

import React from "react";
import { useOrderListViewModel } from "@/hooks/usecases/useOrderListViewModel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function OrderListClient({ initialOrders }: { initialOrders: any[] }) {
  const { viewData, actions } = useOrderListViewModel(initialOrders);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder="주문 번호 검색..."
          value={viewData.filter.search}
          onChange={(e) => actions.onSearchChange(e.target.value)}
        />
        <Button variant="secondary" onClick={actions.onRefresh} isLoading={viewData.isLoading}>
          새로고침
        </Button>
      </div>

      <OrderTableMemo orders={viewData.orders} onSelect={actions.onSelectOrder} />
    </div>
  );
}

// React.memo를 통해 orders 참조가 변경되지 않으면 리렌더링 건너뜀
const OrderTableMemo = React.memo(function OrderTable({
  orders,
  onSelect,
}: {
  orders: any[];
  onSelect: (id: string) => void;
}) {
  return (
    <table className="w-full text-left">
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} onClick={() => onSelect(o.id)} className="cursor-pointer hover:bg-gray-50">
            <td>{o.orderNumber}</td>
            <td>{o.totalAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
```
