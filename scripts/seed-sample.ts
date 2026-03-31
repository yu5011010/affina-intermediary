/**
 * デモ用サンプル投入: npm run db:seed
 * 入れ直し: npm run db:seed -- --force
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import {
  insertSampleData,
  truncateIntermediaryTables,
} from "../lib/db/seed";

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

async function main(): Promise<void> {
  loadEnvLocal();
  const force = process.argv.includes("--force");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY がありません。.env.local に設定してください。",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  if (force) {
    console.log("既存の仲介テーブルを削除してから投入します…");
    await truncateIntermediaryTables(supabase);
  } else {
    const { data, error } = await supabase
      .from("intermediary_users")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    if (data) {
      console.error(
        "すでにユーザーがいます。入れ直す場合: npm run db:seed -- --force",
      );
      process.exit(1);
    }
  }
  await insertSampleData(supabase);
  console.log(
    "投入完了: 広告主1・アフィ1・案件3（EC先頭3商品対応）・成果データなし",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
