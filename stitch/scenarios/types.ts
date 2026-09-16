import type { Page } from "playwright";

/**
 * 📸 표준 화면 캡처 시나리오 인터페이스 (CaptureScenario)
 * 각 페이지/화면별 인터랙션 시나리오는 본 인터페이스를 구현하는 독립 파일로 분리됩니다.
 */
export interface CaptureScenario {
  /** 시나리오 설명 (예: "대시보드 - 최근 주문 탭 뷰") */
  description: string;

  /** 특정 대상 URL로 직접 이동해야 하는 경우 */
  targetUrl?: string;

  /** 스크린샷 캡처 직전 실행할 브라우저 인터랙션 (탭 클릭, 모달 열기 등) */
  beforeCapture?: (page: Page) => Promise<void>;

  /** 캡처 전 렌더링 완료를 대기할 핵심 DOM 셀렉터 */
  waitForSelector?: string;

  /** 추가 렌더링 안정화 대기 시간 (ms, 기본값 1000ms) */
  settleTimeoutMs?: number;
}
