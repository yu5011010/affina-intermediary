import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getIntermediarySupabaseEnv, hasIntermediarySupabaseEnv } from "@/lib/env";
import { seedIfEmpty } from "./seed";

export type AppDatabase = SupabaseClient;

let _client: SupabaseClient | null = null;
let _initPromise: Promise<SupabaseClient> | null = null;

/**
 * Supabase JS（anon key / PostgREST）。EC と同じ NEXT_PUBLIC_* を使用。
 */
export async function getDb(): Promise<SupabaseClient> {
  if (_client) {
    return _client;
  }
  if (!_initPromise) {
    _initPromise = (async () => {
      if (!hasIntermediarySupabaseEnv()) {
        throw new Error(
          "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。",
        );
      }
      const { supabaseUrl, supabaseAnonKey } = getIntermediarySupabaseEnv();
      const client = createClient(supabaseUrl, supabaseAnonKey);
      await seedIfEmpty(client);
      _client = client;
      return client;
    })();
  }
  return _initPromise;
}
