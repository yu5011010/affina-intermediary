// 仲介サイトの型定義（ER_DIAGRAM.md 準拠）

export type UserRole = "advertiser" | "affiliate";

export interface IntermediaryUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export type AdvertiserStatus = "pending" | "approved" | "suspended";

export interface Advertiser {
  id: string;
  userId: string;
  merchantId: string;
  siteName: string;
  siteUrl: string;
  apiSecret: string;
  status: AdvertiserStatus;
  createdAt: string;
  updatedAt: string;
}

export type AffiliateStatus = "pending" | "approved" | "suspended";

export interface Affiliate {
  id: string;
  userId: string;
  affiliateCode: string;
  status: AffiliateStatus;
  payoutInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export type CommissionType = "percent" | "fixed";

/** A8 の「成果条件」に相当 */
export type ConversionGoal = "purchase" | "signup" | "lead";

export interface Campaign {
  id: string;
  advertiserId: string;
  /** EC 通知 API・商品ページフォールバック用の商品 ID */
  externalProductId: string;
  /** 案件名（A8 の案件名） */
  caseName?: string;
  /** LP URL（任意）。未設定時は siteUrl/products/{externalProductId} */
  lpUrl?: string;
  /** 成果条件 */
  conversionGoal?: ConversionGoal;
  /** 承認条件（例: 初回購入のみ） */
  approvalConditions?: string;
  /** @deprecated 案件名は caseName を推奨 */
  productName?: string;
  commissionRate: number;
  commissionType: CommissionType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CONVERSION_GOAL_LABELS: Record<ConversionGoal, string> = {
  purchase: "購入",
  signup: "会員登録",
  lead: "リード（資料請求など）",
};

export type ConversionStatus = "pending" | "approved" | "paid" | "rejected";

export interface Conversion {
  id: string;
  affiliateId: string;
  campaignId: string;
  externalOrderId: string;
  merchantId: string;
  amount: number;
  status: ConversionStatus;
  createdAt: string;
}

export interface DbSchema {
  users: IntermediaryUser[];
  advertisers: Advertiser[];
  affiliates: Affiliate[];
  campaigns: Campaign[];
  conversions: Conversion[];
}
