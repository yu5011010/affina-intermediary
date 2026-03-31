import { NextResponse } from "next/server";

/** DB 接続失敗など未処理例外を JSON で返す（クライアントが parseJson で読める） */
export function jsonError(e: unknown, status = 500): NextResponse {
  const message =
    e instanceof Error ? e.message : "サーバーエラーが発生しました";
  console.error("[api]", message, e);
  return NextResponse.json({ error: message }, { status });
}
