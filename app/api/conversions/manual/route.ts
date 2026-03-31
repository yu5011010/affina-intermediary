import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { getDb } from "@/lib/db/client";
import { createConversion } from "@/lib/db/operations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: {
      affiliateId?: string;
      campaignId?: string;
      externalOrderId?: string;
      merchantId?: string;
      amount?: number;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const affiliateId = body.affiliateId?.trim();
    const campaignId = body.campaignId?.trim();
    const externalOrderId = body.externalOrderId?.trim();
    const merchantId = body.merchantId?.trim();
    const amount = body.amount;
    if (
      !affiliateId ||
      !campaignId ||
      !externalOrderId ||
      !merchantId ||
      typeof amount !== "number"
    ) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const db = await getDb();
    const conversion = await createConversion(db, {
      affiliateId,
      campaignId,
      externalOrderId,
      merchantId,
      amount: Math.round(amount),
    });
    return NextResponse.json(conversion);
  } catch (e) {
    return jsonError(e);
  }
}
