/**
 * 🗄️ Prisma.validator 기반 DTO Select 중앙 카탈로그 (Catalog Index)
 *
 * DB 엔티티의 필요한 컬럼만 안전하게 조회하고 DTO Payload 타입을 유도합니다.
 * 도메인 모델별로 파일을 분리하여 정의한 후 이곳에서 re-export합니다.
 */

import { Prisma } from "@prisma/client";

/**
 * 기본 사용자 카드 DTO Select 명세 예시
 */
export const USER_CARD_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  role: true,
  createdAt: true,
});

export type UserCardPayload = Prisma.UserGetPayload<{
  select: typeof USER_CARD_SELECT;
}>;
