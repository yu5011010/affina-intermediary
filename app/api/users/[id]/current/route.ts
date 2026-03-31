import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { getDb } from "@/lib/db/client";
import { getCurrentUserProfile } from "@/lib/db/operations";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    const db = await getDb();
    const profile = await getCurrentUserProfile(db, id);
    if (!profile) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (e) {
    return jsonError(e);
  }
}
