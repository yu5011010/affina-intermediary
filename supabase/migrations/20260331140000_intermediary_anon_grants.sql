-- 仲介アプリが Supabase JS（anon キー / PostgREST）でテーブルを読み書きするための権限。
-- 適用後: npm run db:ping で接続確認可能。
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.intermediary_users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.advertisers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.affiliates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.conversions TO anon;
