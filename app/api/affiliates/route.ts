import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { getDb } from "@/lib/db/client";
import {
  createAffiliate,
  getAffiliateByCode,
  getAffiliateByUserId,
} from "@/lib/db/operations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId")?.trim();
    const code = url.searchParams.get("code")?.trim();
    const db = await getDb();
    if (code) {
      const a = await getAffiliateByCode(db, code);
      if (!a) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      return NextResponse.json(a);
    }
    if (userId) {
      const a = await getAffiliateByUserId(db, userId);
      if (!a) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      return NextResponse.json(a);
    }
    return NextResponse.json(
      { error: "userId or code required" },
      { status: 400 },
    );
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    let body: { userId?: string; payoutInfo?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const db = await getDb();
    const affiliate = await createAffiliate(db, {
      userId,
      payoutInfo: body.payoutInfo?.trim() || undefined,
    });
    return NextResponse.json(affiliate);
  } catch (e) {
    return jsonError(e);
  }
}
