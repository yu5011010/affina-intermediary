import { NextResponse } from "next/server";

/** 開発用: サーバー再起動で消える。Supabase 移行時は DB insert に差し替え */
const receivedForDev: { at: string; body: unknown }[] = [];

/**
 * EC からの購入成果通知（Bearer 認証）
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

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const entry = { at: new Date().toISOString(), body };
  receivedForDev.push(entry);
  console.log("[api/conversions]", JSON.stringify(entry));

  return NextResponse.json({ ok: true });
}
