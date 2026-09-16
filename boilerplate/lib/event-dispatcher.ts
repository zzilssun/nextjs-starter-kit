/**
 * 📡 도메인 이벤트 디스패처 (Domain Event Dispatcher)
 *
 * Usecase에서 직접 감사 로그나 캐시 태그 삭제 등 부가적인 사이드이펙트를 실행하지 않고,
 * 이벤트를 발행(dispatch)하여 관심사를 분리하고 에러를 격리합니다.
 */

export interface UserRegisteredEvent {
  type: "UserRegistered";
  userId: string;
  email: string;
}

export interface DataSyncedEvent {
  type: "DataSynced";
  jobType: string;
  status: "SUCCESS" | "FAILURE";
  count: number;
}

export interface CacheInvalidateRequestedEvent {
  type: "CacheInvalidateRequested";
  tags: string[];
}

export type AppEvent = UserRegisteredEvent | DataSyncedEvent | CacheInvalidateRequestedEvent;

type EventListener<T extends AppEvent> = (event: T) => Promise<void> | void;

export class EventDispatcher {
  private listeners: Map<string, EventListener<AppEvent>[]> = new Map();

  subscribe<T extends AppEvent["type"]>(
    eventType: T,
    listener: EventListener<Extract<AppEvent, { type: T }>>
  ) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener as EventListener<AppEvent>);
  }

  unsubscribe<T extends AppEvent["type"]>(
    eventType: T,
    listener: EventListener<Extract<AppEvent, { type: T }>>
  ) {
    const list = this.listeners.get(eventType);
    if (!list) return;
    const index = list.indexOf(listener as EventListener<AppEvent>);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  async dispatch<T extends AppEvent["type"]>(eventType: T, event: Extract<AppEvent, { type: T }>) {
    const list = this.listeners.get(eventType);
    if (!list || list.length === 0) return;

    const promises = list.map(async (listener) => {
      try {
        await listener(event);
      } catch (err: unknown) {
        // 리스너 실패가 메인 비즈니스 트랜잭션을 중단시키지 않도록 격리 로깅
        console.error(
          `[EventDispatcher] Listener error for ${eventType}:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    });

    await Promise.all(promises);
  }
}

export const eventDispatcher = new EventDispatcher();

// 기본 내장 구독자 예시 (캐시 무효화 등)
eventDispatcher.subscribe("CacheInvalidateRequested", async (event) => {
  console.log(`[EventDispatcher] Invalidation requested for tags:`, event.tags.join(", "));
});
