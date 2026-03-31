import type { SupabaseClient } from "@supabase/supabase-js";

import {
  generateApiSecret,
  generateId,
  generateMerchantId,
  generateShortCode,
} from "../utils";
import type {
  Advertiser,
  Affiliate,
  Campaign,
  Conversion,
  ConversionGoal,
  CurrentUserProfile,
  IntermediaryUser,
} from "../types";

export type Db = SupabaseClient;

function throwOnError(ctx: string, error: { message: string } | null): void {
  if (error) {
    throw new Error(`${ctx}: ${error.message}`);
  }
}

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
};

type AdvertiserRow = {
  id: string;
  user_id: string;
  merchant_id: string;
  site_name: string;
  site_url: string;
  api_secret: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type AffiliateRow = {
  id: string;
  user_id: string;
  affiliate_code: string;
  status: string;
  payout_info: string | null;
  created_at: string;
  updated_at: string;
};

type CampaignRow = {
  id: string;
  advertiser_id: string;
  external_product_id: string;
  case_name: string | null;
  lp_url: string | null;
  conversion_goal: string | null;
  approval_conditions: string | null;
  product_name: string | null;
  commission_rate: number;
  commission_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ConversionRow = {
  id: string;
  affiliate_id: string;
  campaign_id: string;
  external_order_id: string;
  merchant_id: string;
  amount: number;
  status: string;
  created_at: string;
};

function rowToUser(r: UserRow): IntermediaryUser {
  return {
    id: r.id,
    email: r.email,
    displayName: r.display_name,
    role: r.role as IntermediaryUser["role"],
    createdAt: r.created_at,
  };
}

function rowToAdvertiser(r: AdvertiserRow): Advertiser {
  return {
    id: r.id,
    userId: r.user_id,
    merchantId: r.merchant_id,
    siteName: r.site_name,
    siteUrl: r.site_url,
    apiSecret: r.api_secret,
    status: r.status as Advertiser["status"],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToAffiliate(r: AffiliateRow): Affiliate {
  return {
    id: r.id,
    userId: r.user_id,
    affiliateCode: r.affiliate_code,
    status: r.status as Affiliate["status"],
    payoutInfo: r.payout_info ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id,
    advertiserId: r.advertiser_id,
    externalProductId: r.external_product_id,
    caseName: r.case_name ?? undefined,
    lpUrl: r.lp_url ?? undefined,
    conversionGoal: (r.conversion_goal ?? undefined) as
      | ConversionGoal
      | undefined,
    approvalConditions: r.approval_conditions ?? undefined,
    productName: r.product_name ?? undefined,
    commissionRate: r.commission_rate,
    commissionType: r.commission_type as Campaign["commissionType"],
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToConversion(r: ConversionRow): Conversion {
  return {
    id: r.id,
    affiliateId: r.affiliate_id,
    campaignId: r.campaign_id,
    externalOrderId: r.external_order_id,
    merchantId: r.merchant_id,
    amount: r.amount,
    status: r.status as Conversion["status"],
    createdAt: r.created_at,
  };
}

export async function getUserById(
  db: Db,
  id: string,
): Promise<IntermediaryUser | undefined> {
  const { data, error } = await db
    .from("intermediary_users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwOnError("getUserById", error);
  return data ? rowToUser(data as UserRow) : undefined;
}

export async function getUserByEmail(
  db: Db,
  email: string,
): Promise<IntermediaryUser | undefined> {
  const { data, error } = await db
    .from("intermediary_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  throwOnError("getUserByEmail", error);
  return data ? rowToUser(data as UserRow) : undefined;
}

export async function getCurrentUserProfile(
  db: Db,
  userId: string,
): Promise<CurrentUserProfile | null> {
  const user = await getUserById(db, userId);
  if (!user) {
    return null;
  }
  const { data: adv, error: e1 } = await db
    .from("advertisers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  throwOnError("getCurrentUserProfile advertiser", e1);
  const { data: aff, error: e2 } = await db
    .from("affiliates")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  throwOnError("getCurrentUserProfile affiliate", e2);
  return {
    ...user,
    advertiser: adv ? rowToAdvertiser(adv as AdvertiserRow) : undefined,
    affiliate: aff ? rowToAffiliate(aff as AffiliateRow) : undefined,
  };
}

export async function listAdvertisers(db: Db): Promise<Advertiser[]> {
  const { data, error } = await db.from("advertisers").select("*");
  throwOnError("listAdvertisers", error);
  return (data as AdvertiserRow[] | null)?.map(rowToAdvertiser) ?? [];
}

export async function getAdvertiserByUserId(
  db: Db,
  userId: string,
): Promise<Advertiser | undefined> {
  const { data, error } = await db
    .from("advertisers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  throwOnError("getAdvertiserByUserId", error);
  return data ? rowToAdvertiser(data as AdvertiserRow) : undefined;
}

export async function getAffiliateByUserId(
  db: Db,
  userId: string,
): Promise<Affiliate | undefined> {
  const { data, error } = await db
    .from("affiliates")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  throwOnError("getAffiliateByUserId", error);
  return data ? rowToAffiliate(data as AffiliateRow) : undefined;
}

export async function getAffiliateByCode(
  db: Db,
  code: string,
): Promise<Affiliate | undefined> {
  const { data, error } = await db
    .from("affiliates")
    .select("*")
    .eq("affiliate_code", code)
    .maybeSingle();
  throwOnError("getAffiliateByCode", error);
  return data ? rowToAffiliate(data as AffiliateRow) : undefined;
}

export async function listCampaigns(db: Db): Promise<Campaign[]> {
  const { data, error } = await db.from("campaigns").select("*");
  throwOnError("listCampaigns", error);
  return (data as CampaignRow[] | null)?.map(rowToCampaign) ?? [];
}

export async function getCampaignsByAdvertiser(
  db: Db,
  advertiserId: string,
): Promise<Campaign[]> {
  const { data, error } = await db
    .from("campaigns")
    .select("*")
    .eq("advertiser_id", advertiserId);
  throwOnError("getCampaignsByAdvertiser", error);
  return (data as CampaignRow[] | null)?.map(rowToCampaign) ?? [];
}

export async function getCampaignById(
  db: Db,
  id: string,
): Promise<Campaign | undefined> {
  const { data, error } = await db
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwOnError("getCampaignById", error);
  return data ? rowToCampaign(data as CampaignRow) : undefined;
}

export async function getConversionsByAffiliate(
  db: Db,
  affiliateId: string,
): Promise<Conversion[]> {
  const { data, error } = await db
    .from("conversions")
    .select("*")
    .eq("affiliate_id", affiliateId);
  throwOnError("getConversionsByAffiliate", error);
  return (data as ConversionRow[] | null)?.map(rowToConversion) ?? [];
}

export async function getAdvertiserByMerchantId(
  db: Db,
  merchantId: string,
): Promise<Advertiser | undefined> {
  const { data, error } = await db
    .from("advertisers")
    .select("*")
    .eq("merchant_id", merchantId)
    .maybeSingle();
  throwOnError("getAdvertiserByMerchantId", error);
  return data ? rowToAdvertiser(data as AdvertiserRow) : undefined;
}

export async function createUser(
  db: Db,
  data: { email: string; displayName: string; role: "advertiser" | "affiliate" },
): Promise<IntermediaryUser> {
  const user: IntermediaryUser = {
    id: generateId(),
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    createdAt: new Date().toISOString(),
  };
  throwOnError(
    "createUser",
    (
      await db.from("intermediary_users").insert({
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role: user.role,
        created_at: user.createdAt,
      })
    ).error,
  );
  return user;
}

export async function createAdvertiser(
  db: Db,
  data: { userId: string; siteName: string; siteUrl: string },
): Promise<Advertiser> {
  const advertiser: Advertiser = {
    id: generateId(),
    userId: data.userId,
    merchantId: generateMerchantId(),
    siteName: data.siteName,
    siteUrl: data.siteUrl,
    apiSecret: generateApiSecret(),
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  throwOnError(
    "createAdvertiser",
    (
      await db.from("advertisers").insert({
        id: advertiser.id,
        user_id: advertiser.userId,
        merchant_id: advertiser.merchantId,
        site_name: advertiser.siteName,
        site_url: advertiser.siteUrl,
        api_secret: advertiser.apiSecret,
        status: advertiser.status,
        created_at: advertiser.createdAt,
        updated_at: advertiser.updatedAt,
      })
    ).error,
  );
  return advertiser;
}

export async function createAffiliate(
  db: Db,
  data: { userId: string; payoutInfo?: string },
): Promise<Affiliate> {
  let code = generateShortCode();
  while (await getAffiliateByCode(db, code)) {
    code = generateShortCode();
  }
  const affiliate: Affiliate = {
    id: generateId(),
    userId: data.userId,
    affiliateCode: code,
    status: "approved",
    payoutInfo: data.payoutInfo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  throwOnError(
    "createAffiliate",
    (
      await db.from("affiliates").insert({
        id: affiliate.id,
        user_id: affiliate.userId,
        affiliate_code: affiliate.affiliateCode,
        status: affiliate.status,
        payout_info: affiliate.payoutInfo ?? null,
        created_at: affiliate.createdAt,
        updated_at: affiliate.updatedAt,
      })
    ).error,
  );
  return affiliate;
}

export async function createCampaign(
  db: Db,
  data: {
    advertiserId: string;
    externalProductId: string;
    caseName: string;
    lpUrl?: string;
    conversionGoal: ConversionGoal;
    approvalConditions?: string;
    productName?: string;
    commissionRate: number;
    commissionType: "percent" | "fixed";
  },
): Promise<Campaign> {
  const now = new Date().toISOString();
  const id = generateId();
  throwOnError(
    "createCampaign",
    (
      await db.from("campaigns").insert({
        id,
        advertiser_id: data.advertiserId,
        external_product_id: data.externalProductId,
        case_name: data.caseName.trim(),
        lp_url: data.lpUrl?.trim() || null,
        conversion_goal: data.conversionGoal,
        approval_conditions: data.approvalConditions?.trim() || null,
        product_name: data.productName?.trim() || null,
        commission_rate: data.commissionRate,
        commission_type: data.commissionType,
        is_active: true,
        created_at: now,
        updated_at: now,
      })
    ).error,
  );
  return (await getCampaignById(db, id))!;
}

export async function updateCampaign(
  db: Db,
  campaignId: string,
  patch: {
    externalProductId?: string;
    lpUrl?: string | null;
    isActive?: boolean;
  },
): Promise<Campaign | null> {
  const prev = await getCampaignById(db, campaignId);
  if (!prev) {
    return null;
  }
  const nextExternal =
    patch.externalProductId !== undefined
      ? patch.externalProductId.trim()
      : prev.externalProductId;
  const nextLp =
    patch.lpUrl !== undefined
      ? patch.lpUrl === null
        ? null
        : patch.lpUrl.trim() || null
      : prev.lpUrl ?? null;
  const nextActive =
    patch.isActive !== undefined ? patch.isActive : prev.isActive;
  const updatedAt = new Date().toISOString();

  throwOnError(
    "updateCampaign",
    (
      await db
        .from("campaigns")
        .update({
          external_product_id: nextExternal,
          lp_url: nextLp,
          is_active: nextActive,
          updated_at: updatedAt,
        })
        .eq("id", campaignId)
    ).error,
  );

  const row: CampaignRow = {
    id: prev.id,
    advertiser_id: prev.advertiserId,
    external_product_id: nextExternal,
    case_name: prev.caseName ?? null,
    lp_url: nextLp,
    conversion_goal: prev.conversionGoal ?? null,
    approval_conditions: prev.approvalConditions ?? null,
    product_name: prev.productName ?? null,
    commission_rate: prev.commissionRate,
    commission_type: prev.commissionType,
    is_active: nextActive,
    created_at: prev.createdAt,
    updated_at: updatedAt,
  };
  return rowToCampaign(row);
}

export async function createConversion(
  db: Db,
  data: {
    affiliateId: string;
    campaignId: string;
    externalOrderId: string;
    merchantId: string;
    amount: number;
  },
): Promise<Conversion> {
  const conversion = {
    id: generateId(),
    affiliateId: data.affiliateId,
    campaignId: data.campaignId,
    externalOrderId: data.externalOrderId,
    merchantId: data.merchantId,
    amount: data.amount,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
  throwOnError(
    "createConversion",
    (
      await db.from("conversions").insert({
        id: conversion.id,
        affiliate_id: conversion.affiliateId,
        campaign_id: conversion.campaignId,
        external_order_id: conversion.externalOrderId,
        merchant_id: conversion.merchantId,
        amount: conversion.amount,
        status: conversion.status,
        created_at: conversion.createdAt,
      })
    ).error,
  );
  return rowToConversion({
    id: conversion.id,
    affiliate_id: conversion.affiliateId,
    campaign_id: conversion.campaignId,
    external_order_id: conversion.externalOrderId,
    merchant_id: conversion.merchantId,
    amount: conversion.amount,
    status: conversion.status,
    created_at: conversion.createdAt,
  });
}

/** EC 通知用: ペイロードから案件を解決して成果を1件INSERT（解決できなければ null） */
export async function tryCreateConversionFromInbound(
  db: Db,
  body: {
    merchant_id?: string;
    order_id?: string;
    affiliate_code?: string;
    campaign_id?: string;
    total_amount?: number;
    items?: { product_id?: string }[];
  },
): Promise<Conversion | null> {
  const merchantId = body.merchant_id?.trim();
  const orderId = body.order_id?.trim();
  const affCode = body.affiliate_code?.trim();
  if (!merchantId || !orderId || !affCode) {
    return null;
  }

  const advertiser = await getAdvertiserByMerchantId(db, merchantId);
  if (!advertiser) {
    return null;
  }

  const affiliate = await getAffiliateByCode(db, affCode);
  if (!affiliate) {
    return null;
  }

  let campaign: Campaign | undefined;
  const cid = body.campaign_id?.trim();
  if (cid) {
    const c = await getCampaignById(db, cid);
    if (c && c.advertiserId === advertiser.id) {
      campaign = c;
    }
  }
  if (!campaign) {
    const pid = body.items?.[0]?.product_id?.trim();
    if (pid) {
      const { data: rows, error } = await db
        .from("campaigns")
        .select("*")
        .eq("advertiser_id", advertiser.id)
        .eq("external_product_id", pid)
        .limit(1);
      throwOnError("tryCreateConversionFromInbound campaigns", error);
      const r = rows?.[0] as CampaignRow | undefined;
      campaign = r ? rowToCampaign(r) : undefined;
    }
  }
  if (!campaign) {
    return null;
  }

  const amount =
    typeof body.total_amount === "number" && Number.isFinite(body.total_amount)
      ? Math.round(body.total_amount)
      : 0;

  return createConversion(db, {
    affiliateId: affiliate.id,
    campaignId: campaign.id,
    externalOrderId: orderId,
    merchantId,
    amount,
  });
}
