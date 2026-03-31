import { NextResponse } from "next/server";

// Placeholder middleware for intermediary (no Supabase session)
export function middleware() {
  return NextResponse.next();
}
