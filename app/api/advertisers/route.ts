import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { getDb } from "@/lib/db/client";
import {
  createAdvertiser,
  getAdvertiserByUserId,
  listAdvertisers,
} from "@/lib/db/operations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId")?.trim();
    const db = await getDb();
    if (userId) {
      const a = await getAdvertiserByUserId(db, userId);
      if (!a) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      return NextResponse.json(a);
    }
    return NextResponse.json(await listAdvertisers(db));
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    let body: { userId?: string; siteName?: string; siteUrl?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const userId = body.userId?.trim();
    const siteName = body.siteName?.trim();
    const siteUrl = body.siteUrl?.trim();
    if (!userId || !siteName || !siteUrl) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const db = await getDb();
    const advertiser = await createAdvertiser(db, {
      userId,
      siteName,
      siteUrl,
    });
    return NextResponse.json(advertiser);
  } catch (e) {
    return jsonError(e);
  }
}
