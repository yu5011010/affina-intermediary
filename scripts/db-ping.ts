/**
 * Supabase（anon）接続確認: npm run db:ping
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal(): void {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) {
    return;
  }
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) {
      continue;
    }
    const i = s.indexOf("=");
    if (i === -1) {
      continue;
    }
    const key = s.slice(0, i).trim();
    let val = s.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "(invalid URL)";
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY がありません。.env.local を確認してください。",
    );
    process.exit(1);
  }

  console.log("Supabase URL:", redactUrl(url));

  const supabase = createClient(url, key);
  const { error, count } = await supabase
    .from("intermediary_users")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("結果: 失敗 —", error.message);
    if (
      error.message.includes("permission denied") ||
      error.message.includes("JWT")
    ) {
      console.error(`
ヒント: supabase db push でマイグレーションを当てたうえで、
anon 向け GRANT のマイグレーション（20260331140000_intermediary_anon_grants.sql）が適用されているか確認してください。
`);
    }
    process.exit(1);
  }

  console.log("結果: 接続成功（PostgREST 経由）");
  console.log("  intermediary_users 行数:", count ?? "?");
}

main();
