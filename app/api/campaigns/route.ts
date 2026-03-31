import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { getDb } from "@/lib/db/client";
import {
  createCampaign,
  getCampaignsByAdvertiser,
  listCampaigns,
} from "@/lib/db/operations";
import type { ConversionGoal } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const advertiserId = url.searchParams.get("advertiserId")?.trim();
    const db = await getDb();
    if (advertiserId) {
      return NextResponse.json(
        await getCampaignsByAdvertiser(db, advertiserId),
      );
    }
    return NextResponse.json(await listCampaigns(db));
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    let body: {
      advertiserId?: string;
      externalProductId?: string;
      caseName?: string;
      lpUrl?: string;
      conversionGoal?: ConversionGoal;
      approvalConditions?: string;
      productName?: string;
      commissionRate?: number;
      commissionType?: "percent" | "fixed";
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const advertiserId = body.advertiserId?.trim();
    const externalProductId = body.externalProductId?.trim();
    const caseName = body.caseName?.trim();
    const conversionGoal = body.conversionGoal ?? "purchase";
    const commissionRate = body.commissionRate;
    const commissionType = body.commissionType;
    if (
      !advertiserId ||
      !externalProductId ||
      !caseName ||
      typeof commissionRate !== "number" ||
      (commissionType !== "percent" && commissionType !== "fixed")
    ) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const db = await getDb();
    const campaign = await createCampaign(db, {
      advertiserId,
      externalProductId,
      caseName,
      lpUrl: body.lpUrl?.trim() || undefined,
      conversionGoal,
      approvalConditions: body.approvalConditions?.trim() || undefined,
      productName: body.productName?.trim() || undefined,
      commissionRate,
      commissionType,
    });
    return NextResponse.json(campaign);
  } catch (e) {
    return jsonError(e);
  }
}
