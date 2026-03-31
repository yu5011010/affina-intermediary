import type { SupabaseClient } from "@supabase/supabase-js";

import { buildSampleDb } from "../sampleSeed";

function throwOnError(ctx: string, error: { message: string } | null): void {
  if (error) {
    throw new Error(`${ctx}: ${error.message}`);
  }
}

/** 最小シード（広告主1・アフィ1・EC商品に対応する案件3・成果なし）を INSERT */
export async function insertSampleData(supabase: SupabaseClient): Promise<void> {
  const sample = buildSampleDb();

  const users = sample.users.map((u) => ({
    id: u.id,
    email: u.email,
    display_name: u.displayName,
    role: u.role,
    created_at: u.createdAt,
  }));
  throwOnError(
    "insert intermediary_users",
    (await supabase.from("intermediary_users").insert(users)).error,
  );

  const advertisers = sample.advertisers.map((a) => ({
    id: a.id,
    user_id: a.userId,
    merchant_id: a.merchantId,
    site_name: a.siteName,
    site_url: a.siteUrl,
    api_secret: a.apiSecret,
    status: a.status,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  }));
  throwOnError(
    "insert advertisers",
    (await supabase.from("advertisers").insert(advertisers)).error,
  );

  const affiliates = sample.affiliates.map((a) => ({
    id: a.id,
    user_id: a.userId,
    affiliate_code: a.affiliateCode,
    status: a.status,
    payout_info: a.payoutInfo ?? null,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  }));
  throwOnError(
    "insert affiliates",
    (await supabase.from("affiliates").insert(affiliates)).error,
  );

  const campaigns = sample.campaigns.map((c) => ({
    id: c.id,
    advertiser_id: c.advertiserId,
    external_product_id: c.externalProductId,
    case_name: c.caseName ?? null,
    lp_url: c.lpUrl ?? null,
    conversion_goal: c.conversionGoal ?? null,
    approval_conditions: c.approvalConditions ?? null,
    product_name: c.productName ?? null,
    commission_rate: c.commissionRate,
    commission_type: c.commissionType,
    is_active: c.isActive,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  }));
  throwOnError(
    "insert campaigns",
    (await supabase.from("campaigns").insert(campaigns)).error,
  );

  if (sample.conversions.length > 0) {
    const conversions = sample.conversions.map((c) => ({
      id: c.id,
      affiliate_id: c.affiliateId,
      campaign_id: c.campaignId,
      external_order_id: c.externalOrderId,
      merchant_id: c.merchantId,
      amount: c.amount,
      status: c.status,
      created_at: c.createdAt,
    }));
    throwOnError(
      "insert conversions",
      (await supabase.from("conversions").insert(conversions)).error,
    );
  }
}

/** 仲介テーブルを空にする（サンプル再投入用） */
export async function truncateIntermediaryTables(
  supabase: SupabaseClient,
): Promise<void> {
  const epoch = "1970-01-01T00:00:00.000Z";
  for (const table of [
    "conversions",
    "campaigns",
    "affiliates",
    "advertisers",
    "intermediary_users",
  ] as const) {
    const { error } = await supabase.from(table).delete().gte("created_at", epoch);
    throwOnError(`truncate ${table}`, error);
  }
}

export async function seedIfEmpty(supabase: SupabaseClient): Promise<void> {
  const { data, error } = await supabase
    .from("intermediary_users")
    .select("id")
    .limit(1)
    .maybeSingle();

  throwOnError("seedIfEmpty select", error);

  if (data) {
    return;
  }

  await insertSampleData(supabase);
}
