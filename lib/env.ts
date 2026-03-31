const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasIntermediarySupabaseEnv(): boolean {
  return Boolean(supabaseUrl?.trim() && supabaseAnonKey?.trim());
}

export function getIntermediarySupabaseEnv(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
} {
  const url = supabaseUrl?.trim();
  const key = supabaseAnonKey?.trim();
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください。",
    );
  }
  return { supabaseUrl: url, supabaseAnonKey: key };
}
