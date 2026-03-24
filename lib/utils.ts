export function generateId(): string {
  return crypto.randomUUID();
}

export function generateShortCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

export function generateMerchantId(): string {
  return `mch_${generateShortCode()}`;
}

export function generateApiSecret(): string {
  return `sk_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}
