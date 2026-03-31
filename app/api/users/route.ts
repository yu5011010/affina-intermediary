import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { getDb } from "@/lib/db/client";
import { createUser, getUserByEmail } from "@/lib/db/operations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email")?.trim();
    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }
    const db = await getDb();
    const user = await getUserByEmail(db, email);
    if (!user) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    let body: {
      email?: string;
      displayName?: string;
      role?: "advertiser" | "affiliate";
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const email = body.email?.trim();
    const displayName = body.displayName?.trim();
    const role = body.role;
    if (
      !email ||
      !displayName ||
      (role !== "advertiser" && role !== "affiliate")
    ) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const db = await getDb();
    const user = await createUser(db, { email, displayName, role });
    return NextResponse.json(user);
  } catch (e) {
    return jsonError(e);
  }
}
