/**
 * 🛠️ 표준 포맷팅 및 안전 파싱 유틸리티 (Format & Parse Utilities)
 *
 * 화면별 toLocaleString() 남발 방지, SSR/CSR Hydration Mismatch 방어, 안전한 결측값 처리를 보장합니다.
 */

/**
 * 통화 금액 포매터 (기본값: 원화 KRW)
 */
export function formatCurrency(
  amount?: number | null,
  currencyCode = "KRW",
  locale = "ko-KR"
): string {
  if (amount == null || isNaN(amount)) {
    return currencyCode === "KRW" ? "₩ 0" : `${currencyCode} 0`;
  }

  const formatted = Math.round(amount).toLocaleString(locale);
  if (currencyCode === "KRW") return `₩ ${formatted}`;
  if (currencyCode === "USD") return `$ ${amount.toFixed(2)}`;
  return `${currencyCode} ${formatted}`;
}

/**
 * 일반 숫자 천 단위 구분 콤마 포매터
 */
export function formatNumber(val?: number | null, fallback = "0"): string {
  if (val == null || isNaN(val)) return fallback;
  return val.toLocaleString("ko-KR");
}

/**
 * 백분율 포매터 (기본 소수점 1자리)
 */
export function formatPercent(val?: number | null, digits = 1): string {
  if (val == null || isNaN(val)) return "-";
  return `${Number(val.toFixed(digits))}%`;
}

/**
 * Next.js Hydration Mismatch 없는 표준 일시 포매터 (YYYY-MM-DD HH:mm)
 */
export function formatDateTime(date?: Date | string | number | null): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 쉼표가 포함된 문자열이나 null을 안전하게 number로 파싱
 */
export function parseNumberSafe(val: unknown, fallback = 0): number {
  if (val == null) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  if (typeof val === "string") {
    const cleaned = val.replace(/,/g, "").trim();
    if (!cleaned) return fallback;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * 정수 안전 파싱
 */
export function parseIntegerSafe(val: unknown, fallback = 0): number {
  const num = parseNumberSafe(val, fallback);
  return Math.trunc(num);
}
