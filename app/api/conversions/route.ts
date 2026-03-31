import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { getDb } from "@/lib/db/client";
import {
  getConversionsByAffiliate,
  tryCreateConversionFromInbound,
} from "@/lib/db/operations";

export const runtime = "nodejs";

/** 開発用: サーバー再起動まで保持（デバッグログ用） */
const receivedForDev: { at: string; body: unknown }[] = [];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const affiliateId = url.searchParams.get("affiliateId")?.trim();
    if (!affiliateId) {
      return NextResponse.json(
        { error: "affiliateId required" },
        { status: 400 },
      );
    }
    const db = await getDb();
    return NextResponse.json(
      await getConversionsByAffiliate(db, affiliateId),
    );
  } catch (e) {
    return jsonError(e);
  }
}

/** Authorization: Bearer … または X-Api-Key（同一シークレット）。ドキュメントの「X-Merchant-Id + X-Api-Key」に合わせ X-Merchant-Id が付いていれば body.merchant_id と一致必須 */
function inboundSecretFromHeaders(request: Request): string | null {
  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const t = auth.slice(7).trim();
    return t || null;
  }
  const apiKey = request.headers.get("x-api-key")?.trim();
  if (apiKey) {
    return apiKey;
  }
  return null;
}

/**
 * EC からの購入成果通知（Bearer または X-Api-Key）
 * Body: { merchant_id, order_id, affiliate_code, campaign_id?, total_amount, items[] }
 */
export async function POST(request: Request) {
  const secret = process.env.AFFINA_INBOUND_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "AFFINA_INBOUND_SECRET is not set" },
      { status: 503 },
    );
  }

  const token = inboundSecretFromHeaders(request);
  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const headerMerchantId = request.headers.get("x-merchant-id")?.trim();
  const b = body as Record<string, unknown>;
  const bodyMerchantId =
    typeof b.merchant_id === "string" ? b.merchant_id.trim() : "";
  if (headerMerchantId && headerMerchantId !== bodyMerchantId) {
    return NextResponse.json(
      { error: "X-Merchant-Id does not match body merchant_id" },
      { status: 403 },
    );
  }

  const entry = { at: new Date().toISOString(), body };
  receivedForDev.push(entry);
  console.log("[api/conversions]", JSON.stringify(entry));

  try {
    const db = await getDb();
    const inserted = await tryCreateConversionFromInbound(db, {
      merchant_id: typeof b.merchant_id === "string" ? b.merchant_id : undefined,
      order_id: typeof b.order_id === "string" ? b.order_id : undefined,
      affiliate_code:
        typeof b.affiliate_code === "string" ? b.affiliate_code : undefined,
      campaign_id:
        typeof b.campaign_id === "string" ? b.campaign_id : undefined,
      total_amount:
        typeof b.total_amount === "number" ? b.total_amount : undefined,
      items: Array.isArray(b.items)
        ? (b.items as { product_id?: string }[])
        : undefined,
    });

    return NextResponse.json({
      ok: true,
      persisted: Boolean(inserted),
      conversionId: inserted?.id ?? null,
    });
  } catch (e) {
    return jsonError(e);
  }
}
