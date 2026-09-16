import { useState, useMemo, useRef } from "react";

export interface ItemRowViewData {
  id: string;
  title: string;
  amount: number;
}

export interface ExampleViewData {
  filter: { search: string; category: string };
  items: ItemRowViewData[];
  isLoading: boolean;
  selectedId: string | null;
}

export interface ExampleActions {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onSelectItem: (id: string | null) => void;
  onRefresh: () => Promise<void>;
}

/**
 * 🎭 표준 MVVM ViewModel 커스텀 훅 원형
 */
export function useExampleViewModel(initialItems: ItemRowViewData[] = []) {
  // 1. Single Source of Truth: 단일 통합 상태 객체
  const [state, setState] = useState<ExampleViewData>({
    filter: { search: "", category: "ALL" },
    items: initialItems,
    isLoading: false,
    selectedId: null,
  });

  // 비동기 요청 레이스 컨디션 방어용 ID 카운터
  const requestIdRef = useRef(0);

  // 2. ViewData: 단일 읽기 전용 상태
  const viewData = state;

  // 3. Actions: 빈 의존성 배열([])로 단 1회만 인스턴스화되는 불변 액션 객체
  const actions: ExampleActions = useMemo(
    () => ({
      onSearchChange: (search: string) => {
        setState((prev) => ({
          ...prev,
          filter: { ...prev.filter, search }, // items, selectedId 참조 완벽 보존
        }));
      },
      onCategoryChange: (category: string) => {
        setState((prev) => ({
          ...prev,
          filter: { ...prev.filter, category },
        }));
      },
      onSelectItem: (id: string | null) => {
        setState((prev) => ({
          ...prev,
          selectedId: id,
        }));
      },
      onRefresh: async () => {
        const currentReqId = ++requestIdRef.current;
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
          // 비즈니스 Server Action 호출 (예: const data = await fetchItemsAction(...))
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (currentReqId !== requestIdRef.current) return; // 이전 요청 폐기
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
