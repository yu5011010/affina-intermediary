import type { Advertiser, Campaign } from "./types";

/**
 * EC 流入用の計測クエリを付与（既存クエリは保持）
 * - ref: アフィリエイトコード（仲介の affiliate_code）
 * - campaign_id: 仲介側の案件 ID（成果紐付け・デバッグ用）
 */
export function appendTrackingParams(
  url: string,
  ref: string,
  campaignId: string
): string {
  try {
    const u = new URL(url);
    u.searchParams.set("ref", ref);
    if (campaignId.trim()) {
      u.searchParams.set("campaign_id", campaignId.trim());
    }
    return u.toString();
  } catch {
    return url;
  }
}

/** @deprecated appendTrackingParams を使用 */
export function appendRefParam(url: string, ref: string): string {
  return appendTrackingParams(url, ref, "");
}

/** アフィリエイト用リンク: LP URL があればそこへ、なければ EC 商品ページ */
export function buildAffiliateLink(
  campaign: Campaign,
  advertiser: Advertiser,
  affiliateCode: string
): string {
  const ref = affiliateCode;
  const campaignId = campaign.id;
  if (campaign.lpUrl?.trim()) {
    return appendTrackingParams(campaign.lpUrl.trim(), ref, campaignId);
  }
  const base = advertiser.siteUrl.replace(/\/$/, "");
  const productUrl = `${base}/products/${encodeURIComponent(campaign.externalProductId)}`;
  return appendTrackingParams(productUrl, ref, campaignId);
}

export function displayCaseName(c: Campaign): string {
  return (
    (c.caseName?.trim() || c.productName?.trim() || c.externalProductId) ??
    "（無題）"
  );
}
