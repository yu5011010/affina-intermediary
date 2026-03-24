/**
 * デモ用サンプルデータ（localStorage が空のときのみ storage が注入）
 *
 * EC の `supabase/seed.sql` と先頭3商品の UUID を揃え済み。
 * `supabase db reset` 後はそのまま
 *   http://localhost:3000/products/aaaaaaaa-aaaa-4aaa-8aaa-000000000001?ref=demoaff1&campaign_id=...
 * で購入フローまで試せます（campaign_id は案件詳細の広告リンクからコピー）。
 */

import type { DbSchema } from "./types";

const iso = (d: string) => new Date(d).toISOString();

/** 固定 ID（再注入で重複しないよう storage 側で空 DB のときのみマージ） */
export const SAMPLE_IDS = {
  userAdvertiser: "11111111-1111-4111-8111-111111111101",
  userAffiliate: "11111111-1111-4111-8111-111111111102",
  userAffiliate2: "11111111-1111-4111-8111-111111111103",
  advertiser: "22222222-2222-4222-8222-222222222201",
  affiliate: "22222222-2222-4222-8222-222222222202",
  affiliate2: "22222222-2222-4222-8222-222222222203",
  /** キーボード案件（EC 商品 …0002） */
  campaignKeyboard: "33333333-3333-4333-8333-333333333301",
  /** デスクセット案件（EC 商品 …0001） */
  campaignDesk: "33333333-3333-4333-8333-333333333302",
  /** 会員登録 LP */
  campaignSignup: "33333333-3333-4333-8333-333333333303",
  /** マグカップ（EC 商品 …0003） */
  campaignTravelMug: "33333333-3333-4333-8333-333333333304",
  /** 募集終了サンプル（一覧に出るがリンクは無効運用のイメージ） */
  campaignPaused: "33333333-3333-4333-8333-333333333305",
  conversion1: "44444444-4444-4444-8444-444444444401",
  conversion2: "44444444-4444-4444-8444-444444444402",
  conversion3: "44444444-4444-4444-8444-444444444403",
  conversion4: "44444444-4444-4444-8444-444444444404",
} as const;

/** new_project/supabase/seed.sql の先頭3商品と同一 */
const EC_PRODUCT_DESK = "aaaaaaaa-aaaa-4aaa-8aaa-000000000001";
const EC_PRODUCT_KEYBOARD = "aaaaaaaa-aaaa-4aaa-8aaa-000000000002";
const EC_PRODUCT_TRAVEL_MUG = "aaaaaaaa-aaaa-4aaa-8aaa-000000000003";

export function buildSampleDb(): DbSchema {
  return {
    users: [
      {
        id: SAMPLE_IDS.userAdvertiser,
        email: "demo-advertiser@example.com",
        displayName: "デモ広告主（サンプル）",
        role: "advertiser",
        createdAt: iso("2025-01-01T00:00:00Z"),
      },
      {
        id: SAMPLE_IDS.userAffiliate,
        email: "demo-affiliate@example.com",
        displayName: "デモアフィリエイター（サンプル）",
        role: "affiliate",
        createdAt: iso("2025-01-01T00:00:00Z"),
      },
      {
        id: SAMPLE_IDS.userAffiliate2,
        email: "demo-affiliate2@example.com",
        displayName: "デモアフィリエイター2（サンプル）",
        role: "affiliate",
        createdAt: iso("2025-01-01T00:00:01Z"),
      },
    ],
    advertisers: [
      {
        id: SAMPLE_IDS.advertiser,
        userId: SAMPLE_IDS.userAdvertiser,
        merchantId: "mch_demo_affina",
        siteName: "Affina Shop（デモ）",
        siteUrl: "http://localhost:3000",
        apiSecret: "sk_demo_sample_do_not_use_in_production",
        status: "approved",
        createdAt: iso("2025-01-01T00:00:00Z"),
        updatedAt: iso("2025-01-01T00:00:00Z"),
      },
    ],
    affiliates: [
      {
        id: SAMPLE_IDS.affiliate,
        userId: SAMPLE_IDS.userAffiliate,
        affiliateCode: "demoaff1",
        status: "approved",
        payoutInfo: "デモ用（銀行口座ダミー）",
        createdAt: iso("2025-01-01T00:00:00Z"),
        updatedAt: iso("2025-01-01T00:00:00Z"),
      },
      {
        id: SAMPLE_IDS.affiliate2,
        userId: SAMPLE_IDS.userAffiliate2,
        affiliateCode: "demoaff2",
        status: "approved",
        payoutInfo: "デモ用アフィ2",
        createdAt: iso("2025-01-01T00:00:02Z"),
        updatedAt: iso("2025-01-01T00:00:02Z"),
      },
    ],
    campaigns: [
      {
        id: SAMPLE_IDS.campaignDesk,
        advertiserId: SAMPLE_IDS.advertiser,
        externalProductId: EC_PRODUCT_DESK,
        caseName: "Desk Setup Starter Kit（直リンク）",
        lpUrl: undefined,
        conversionGoal: "purchase",
        approvalConditions: "購入確定から30日以内の注文に限る",
        commissionRate: 8,
        commissionType: "percent",
        isActive: true,
        createdAt: iso("2025-01-03T00:00:00Z"),
        updatedAt: iso("2025-01-03T00:00:00Z"),
      },
      {
        id: SAMPLE_IDS.campaignKeyboard,
        advertiserId: SAMPLE_IDS.advertiser,
        externalProductId: EC_PRODUCT_KEYBOARD,
        caseName: "Focus Mechanical Keyboard（外部LP経由）",
        lpUrl: "https://example.com/lp/demo-keyboard",
        conversionGoal: "purchase",
        approvalConditions: "初回購入のみ。バンドル品は対象外。",
        commissionRate: 1200,
        commissionType: "fixed",
        isActive: true,
        createdAt: iso("2025-01-02T00:00:00Z"),
        updatedAt: iso("2025-01-02T00:00:00Z"),
      },
      {
        id: SAMPLE_IDS.campaignTravelMug,
        advertiserId: SAMPLE_IDS.advertiser,
        externalProductId: EC_PRODUCT_TRAVEL_MUG,
        caseName: "Travel Mug Pro 春キャンペーン",
        lpUrl: undefined,
        conversionGoal: "purchase",
        approvalConditions: "通常価格購入のみ",
        commissionRate: 5,
        commissionType: "percent",
        isActive: true,
        createdAt: iso("2025-01-05T00:00:00Z"),
        updatedAt: iso("2025-01-05T00:00:00Z"),
      },
      {
        id: SAMPLE_IDS.campaignSignup,
        advertiserId: SAMPLE_IDS.advertiser,
        externalProductId: EC_PRODUCT_DESK,
        caseName: "メルマガ・会員登録",
        lpUrl: "http://localhost:3000/register",
        conversionGoal: "signup",
        approvalConditions: "本登録完了後、広告主が承認したものに限る",
        commissionRate: 500,
        commissionType: "fixed",
        isActive: true,
        createdAt: iso("2025-01-04T00:00:00Z"),
        updatedAt: iso("2025-01-04T00:00:00Z"),
      },
      {
        id: SAMPLE_IDS.campaignPaused,
        advertiserId: SAMPLE_IDS.advertiser,
        externalProductId: EC_PRODUCT_DESK,
        caseName: "（募集終了）デスク旧単価バンドル",
        lpUrl: undefined,
        conversionGoal: "purchase",
        approvalConditions: "2024年以前の規約に基づく成果のみ",
        commissionRate: 10,
        commissionType: "percent",
        isActive: false,
        createdAt: iso("2024-06-01T00:00:00Z"),
        updatedAt: iso("2025-01-01T00:00:00Z"),
      },
    ],
    conversions: [
      {
        id: SAMPLE_IDS.conversion1,
        affiliateId: SAMPLE_IDS.affiliate,
        campaignId: SAMPLE_IDS.campaignDesk,
        externalOrderId: "demo-order-001",
        merchantId: "mch_demo_affina",
        amount: 10240,
        status: "approved",
        createdAt: iso("2025-01-10T12:00:00Z"),
      },
      {
        id: SAMPLE_IDS.conversion2,
        affiliateId: SAMPLE_IDS.affiliate,
        campaignId: SAMPLE_IDS.campaignKeyboard,
        externalOrderId: "demo-order-002",
        merchantId: "mch_demo_affina",
        amount: 18400,
        status: "pending",
        createdAt: iso("2025-01-11T09:30:00Z"),
      },
      {
        id: SAMPLE_IDS.conversion3,
        affiliateId: SAMPLE_IDS.affiliate2,
        campaignId: SAMPLE_IDS.campaignTravelMug,
        externalOrderId: "demo-order-003",
        merchantId: "mch_demo_affina",
        amount: 4200,
        status: "paid",
        createdAt: iso("2025-01-08T15:00:00Z"),
      },
      {
        id: SAMPLE_IDS.conversion4,
        affiliateId: SAMPLE_IDS.affiliate,
        campaignId: SAMPLE_IDS.campaignDesk,
        externalOrderId: "demo-order-004",
        merchantId: "mch_demo_affina",
        amount: 12800,
        status: "rejected",
        createdAt: iso("2025-01-05T10:00:00Z"),
      },
    ],
  };
}

export function isDbEmpty(db: DbSchema): boolean {
  return (
    db.users.length === 0 &&
    db.advertisers.length === 0 &&
    db.affiliates.length === 0 &&
    db.campaigns.length === 0 &&
    db.conversions.length === 0
  );
}
