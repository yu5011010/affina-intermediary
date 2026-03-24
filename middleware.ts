import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Placeholder middleware for intermediary (no Supabase session)
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
