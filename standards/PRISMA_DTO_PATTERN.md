# 🗄️ Prisma.validator 기반 DTO Select 카탈로그 & Mapper 패턴

본 문서는 데이터베이스(PostgreSQL) 레이어와 애플리케이션(UI, Server Actions, Services) 레이어 간의 강결합을 차단하고, 런타임 Null 에러를 원천 방지하기 위한 **DTO Mapper & Prisma.validator 표준 가이드**입니다.

---

## 📌 1. 핵심 철학 (Architecture Philosophy)

1. **원시 DB 엔티티 노출 금지**:
   - UI 컴포넌트나 클라이언트 네트워크 응답으로 Prisma의 원시 엔티티(raw Model)를 직접 반환하는 것을 금지합니다.
   - 비밀번호, 민감한 개인정보, 내부 메타데이터가 외부로 노출되는 보안 사고를 방지하고, DB 스키마 변경 시 UI가 연쇄 파괴되는 것을 막습니다.
2. **단방향 데이터 흐름**:
   $$\text{Database (PostgreSQL)} \longrightarrow \text{Prisma Select} \longrightarrow \text{Mapper} \longrightarrow \text{DTO (Strict Interface)} \longrightarrow \text{UI}$$
3. **`Prisma.validator` 중앙 카탈로그**:
   - 쿼리마다 임의로 `select: { id: true, name: true }`를 하드코딩하지 않고, `src/lib/prisma-selects/`에 사전 검증된 표준 Select 상수를 정의하여 재사용합니다.

---

## 💻 2. 실전 구현 패턴 (Implementation Pattern)

### A. 중앙 DTO Select 정의 (`src/lib/prisma-selects/user.select.ts`)

```typescript
import { Prisma } from "@prisma/client";

// 1. Prisma.validator를 통한 타입 검증된 Select 상수 정의
export const USER_CARD_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  createdAt: true,
  profile: {
    select: {
      avatarUrl: true,
      bio: true,
    },
  },
});

// 2. Prisma.GetPayload를 통해 쿼리 결과 타입을 자동 유도
export type UserCardPayload = Prisma.UserGetPayload<{
  select: typeof USER_CARD_SELECT;
}>;
```

### B. DTO 인터페이스 및 Mapper 구현 (`src/services/server/mappers/user.mapper.ts`)

```typescript
import { UserCardPayload } from "@/lib/prisma-selects/user.select";

// 1. UI에 안전하게 전달될 최종 DTO 타입 정의
export interface UserCardDTO {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  joinedDate: string;
}

// 2. Mapper 함수: Payload를 DTO로 변환
export function toUserCardDTO(entity: UserCardPayload): UserCardDTO {
  return {
    id: entity.id,
    displayName: entity.name || "익명 사용자",
    email: entity.email,
    avatarUrl: entity.profile?.avatarUrl ?? null,
    joinedDate: entity.createdAt.toISOString().split("T")[0],
  };
}
```

### C. 서비스에서 쿼리 실행 및 DTO 반환 (`src/services/server/user.service.ts`)

```typescript
import { prisma } from "@/lib/prisma";
import { USER_CARD_SELECT } from "@/lib/prisma-selects/user.select";
import { toUserCardDTO, UserCardDTO } from "./mappers/user.mapper";

export class UserService {
  async getUserCard(userId: string): Promise<UserCardDTO | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_CARD_SELECT, // 중앙 Select 재사용
    });

    if (!user) return null;
    return toUserCardDTO(user);
  }
}
```

---

## 🌟 3. 패턴 적용의 이점

1. **완벽한 타입 안정성**: Prisma 스키마 필드가 변경되면 `USER_CARD_SELECT`와 `toUserCardDTO`에서 컴파일 에러가 발생하여 런타임 오류를 사전에 100% 차단합니다.
2. **최소 네트워크 전송 (Lightweight Payload)**: 불필요한 대용량 텍스트나 관계 데이터를 쿼리하지 않고, 명시적으로 필요한 컬럼만 데이터베이스에서 조회합니다.
3. **보안성**: 민감한 필드(해시된 패스워드, 결제 토큰 등)가 DTO 변환 과정에서 원천 제거됩니다.
