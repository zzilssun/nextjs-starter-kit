# 🏛️ Next.js + PostgreSQL 전역 코딩 규격 및 아키텍처 표준

본 문서는 신규 Next.js + PostgreSQL 프로젝트에서 모든 엔지니어와 AI 에이전트가 준수해야 하는 **전역 코딩 표준이자 아키텍처 설계 원칙**입니다.

---

## 🎯 1. TypeScript 엄격성 (TypeScript Strictness)

- **`any` 타입 사용 전면 금지**: `any` 타입의 사용을 엄격히 금지합니다.
  - 알 수 없는 타입은 `unknown`을 사용하고, 타입 가드(`typeof`, `instanceof`, 커스텀 타입 가드)를 통해 타입을 좁힙니다.
  - 복합 객체는 반드시 TypeScript `interface` 또는 `type`을 선언하며, 필요 시 Zod 스키마(`z.infer<typeof Schema>`)를 활용합니다.
- **컴파일 에러 0건 원칙**: 모든 작업 완료 후 `npx tsc --noEmit` 실행 시 컴파일/타입 에러가 0건이어야 합니다.

---

## ⚡ 2. Next.js App Router 렌더링 표준

### React Server Component (RSC) First

- 모든 페이지(`page.tsx`)와 정적 레이아웃 컴포넌트는 기본적으로 **React Server Component**로 구현합니다.
- 클라이언트 컴포넌트(`"use client"`)는 상태 관리, 브라우저 이벤트(`onClick`, `onChange`), 또는 DOM 접근이 반드시 필요한 말단 리프(Leaf) 컴포넌트로 엄격히 제한합니다.

### Thin Controller Server Actions

- Server Actions (`src/actions/`)는 **얇은 컨트롤러(Thin Controller)** 역할만 수행합니다:
  1. 사용자 인증 및 세션 검증
  2. Zod 스키마를 통한 입력값 검증
  3. 비즈니스 서비스(`src/services/server/`) 호출
  4. 결과 반환 및 Next.js 캐시 재검증(`revalidatePath`, `revalidateTag`)
- 비즈니스 로직, 복잡한 다중 트랜잭션, 외부 API 연동 코드를 Server Action 내부에 직접 인라인으로 구현하는 것을 금지합니다.

---

## 🏢 3. 서비스 계층 분리 & 의존성 주입 (Service Layer & DI)

### 서비스 클래스 캡슐화 (`src/services/server/`)

- 도메인 비즈니스 로직과 데이터베이스 트랜잭션은 전용 Service 클래스(예: `UserService`, `OrderService`)로 캡슐화합니다.

### 생성자 기반 의존성 주입 (Dependency Injection)

- 서비스 내부에서 싱글톤 `prisma` 인스턴스를 정적으로 직접 import하여 사용하는 것을 지양하고, 생성자(Constructor) 인자를 통해 주입받도록 설계합니다:

```typescript
// ✅ 올바른 패턴: 생성자 주입을 통한 테스트 용이성 확보
export class OrderService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async createOrder(data: CreateOrderInput): Promise<OrderDTO> {
    return this.db.$transaction(async (tx) => {
      // 비즈니스 로직 실행
    });
  }
}
```

---

## 📡 4. 도메인 이벤트 기반 사이드이펙트 격리 (`EventDispatcher`)

- **원칙**: 핵심 비즈니스 로직(주문 생성, 결제 승인, 사용자 등록 등) 내부에 부가적인 사이드이펙트(알림 발송, 감사 로그 기록, 슬랙 웹훅 전송, 캐시 태그 삭제)를 동기식으로 결합하지 않습니다.
- **`EventDispatcher` 패턴**:
  - Usecase는 핵심 작업 완료 후 순수 도메인 이벤트를 발행(`dispatch`)하기만 합니다.
  - 사이드이펙트 리스너들은 `EventDispatcher`에 등록되어 독립적인 `try-catch` 블록 내에서 실행되므로, 부가 기능 실패가 메인 비즈니스 트랜잭션을 중단시키지 않습니다.

```typescript
// ✅ 도메인 이벤트 발행 예시
await eventDispatcher.dispatch("OrderCreated", {
  orderId: order.id,
  userId: user.id,
  totalAmount: order.totalAmount,
});
```

---

## 🛡️ 5. 에러 처리 및 루프 차단 (Error Handling)

- **외부 API 및 비동기 작업**: 모든 외부 API 호출과 비동기 I/O는 명시적인 `try-catch` 블록으로 감싸고, 실패 시 안전한 Fallback 또는 명확한 커스텀 에러 객체를 반환합니다.
- **에러 루프 게이트 (Error Loop Gate)**: AI 에이전트가 동일한 에러를 5회 연속 발생시킬 경우, 맹목적인 시도를 멈추고 현재 상태를 요약한 후 사용자에게 명시적으로 가이드를 요청해야 합니다.
- **패턴 기반 일괄 수정**: 리팩토링 후 유사한 컴파일 에러가 여러 파일에서 반복될 경우, 하나씩 빌드하며 수정하지 않고 전역 검색으로 동일 패턴을 한 번에 일괄 수정합니다.
