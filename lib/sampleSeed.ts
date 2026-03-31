/**
 * 最小シード: EC（new_project/supabase/seed.sql）の先頭3商品に対応するキャンペーンのみ。
 * 成果（conversions）は投入しない（購入通知で増える）。
 *
 * 例: http://localhost:3000/products/aaaaaaaa-aaaa-4aaa-8aaa-000000000001?ref=demoaff1&campaign_id={案件UUID}
 */

import type { DbSchema } from "./types";

const iso = (d: string) => new Date(d).toISOString();

export const SAMPLE_IDS = {
  userAdvertiser: "11111111-1111-4111-8111-111111111101",
  userAffiliate: "11111111-1111-4111-8111-111111111102",
  advertiser: "22222222-2222-4222-8222-222222222201",
  affiliate: "22222222-2222-4222-8222-222222222202",
  campaignDesk: "33333333-3333-4333-8333-333333333302",
  campaignKeyboard: "33333333-3333-4333-8333-333333333301",
  campaignTravelMug: "33333333-3333-4333-8333-333333333304",
} as const;

const EC_PRODUCT_DESK = "aaaaaaaa-aaaa-4aaa-8aaa-000000000001";
const EC_PRODUCT_KEYBOARD = "aaaaaaaa-aaaa-4aaa-8aaa-000000000002";
const EC_PRODUCT_TRAVEL_MUG = "aaaaaaaa-aaaa-4aaa-8aaa-000000000003";

export function buildSampleDb(): DbSchema {
  return {
    users: [
      {
        id: SAMPLE_IDS.userAdvertiser,
        email: "demo-advertiser@example.com",
        displayName: "デモ広告主",
        role: "advertiser",
        createdAt: iso("2025-01-01T00:00:00Z"),
      },
      {
        id: SAMPLE_IDS.userAffiliate,
        email: "demo-affiliate@example.com",
        displayName: "デモアフィリエイター",
        role: "affiliate",
        createdAt: iso("2025-01-01T00:00:00Z"),
      },
    ],
    advertisers: [
      {
        id: SAMPLE_IDS.advertiser,
        userId: SAMPLE_IDS.userAdvertiser,
        merchantId: "mch_demo_affina",
        siteName: "Affina Shop",
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
        createdAt: iso("2025-01-01T00:00:00Z"),
        updatedAt: iso("2025-01-01T00:00:00Z"),
      },
    ],
    campaigns: [
      {
        id: SAMPLE_IDS.campaignDesk,
        advertiserId: SAMPLE_IDS.advertiser,
        externalProductId: EC_PRODUCT_DESK,
        caseName: "Desk Setup Starter Kit",
        lpUrl: undefined,
        conversionGoal: "purchase",
        approvalConditions: "購入確定後、広告主が承認したものに限る",
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
        caseName: "Focus Mechanical Keyboard",
        lpUrl: undefined,
        conversionGoal: "purchase",
        approvalConditions: "初回購入のみ",
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
        caseName: "Travel Mug Pro",
        lpUrl: undefined,
        conversionGoal: "purchase",
        approvalConditions: "通常価格購入のみ",
        commissionRate: 5,
        commissionType: "percent",
        isActive: true,
        createdAt: iso("2025-01-05T00:00:00Z"),
        updatedAt: iso("2025-01-05T00:00:00Z"),
      },
    ],
    conversions: [],
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
