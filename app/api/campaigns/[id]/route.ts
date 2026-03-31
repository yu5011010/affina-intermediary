import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { getDb } from "@/lib/db/client";
import { getCampaignById, updateCampaign } from "@/lib/db/operations";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    const db = await getDb();
    const c = await getCampaignById(db, id);
    if (!c) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(c);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    let body: {
      externalProductId?: string;
      lpUrl?: string | null;
      isActive?: boolean;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const db = await getDb();
    const updated = await updateCampaign(db, id, body);
    if (!updated) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    return jsonError(e);
  }
}
