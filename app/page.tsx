"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SAMPLE_IDS } from "@/lib/sampleSeed";
import { getCurrentUser, setCurrentUser, storage } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [hasDemoAccounts, setHasDemoAccounts] = useState(false);

  const refreshUser = useCallback(() => {
    setUser(getCurrentUser());
    setHasDemoAccounts(
      Boolean(storage.getUserById(SAMPLE_IDS.userAdvertiser))
    );
  }, []);

  useEffect(() => {
    refreshUser();
    window.addEventListener("affina-user-changed", refreshUser);
    return () => window.removeEventListener("affina-user-changed", refreshUser);
  }, [refreshUser]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900">
        Affina アフィリエイト
      </h1>
      <p className="mb-12 text-lg text-slate-600">
        広告主とアフィリエイターをつなぎ、成果報酬を管理するプラットフォームです。
      </p>

      {user ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-4 text-slate-700">
            {user.displayName || user.email} さんでログイン中
          </p>
          <div className="flex gap-4">
            {user.advertiser && (
              <Link
                href="/advertisers/dashboard"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
              >
                広告主ダッシュボード
              </Link>
            )}
            {user.affiliate && (
              <>
                <Link
                  href="/affiliates/campaigns"
                  className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700"
                >
                  案件一覧
                </Link>
                <Link
                  href="/affiliates/dashboard"
                  className="rounded-lg border border-emerald-600 px-6 py-3 font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  ダッシュボード
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/register?type=advertiser"
            className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              広告主として登録
            </h2>
            <p className="text-slate-600">
              自社の商品やサービスをアフィリエイターに宣伝してもらい、成果に応じて報酬を支払います。
            </p>
          </Link>
          <Link
            href="/register?type=affiliate"
            className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              アフィリエイターとして登録
            </h2>
            <p className="text-slate-600">
              広告主の商品を宣伝し、購入が発生したら報酬を受け取れます。
            </p>
          </Link>

          {hasDemoAccounts ? (
            <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50/80 p-6">
              <h3 className="mb-2 font-semibold text-slate-900">
                サンプルデータで試す
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                初回アクセス時にダミーの広告主・<strong>アフィ2名</strong>・案件5件・成果4件が入ります（localStorage
                が空のときのみ）。パスワードはありません。EC 連携は{" "}
                <code className="rounded bg-white px-1 text-xs">
                  supabase db reset
                </code>{" "}
                後の商品 UUID と一致します。
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const u = storage.getUserById(SAMPLE_IDS.userAdvertiser);
                    if (u) {
                      setCurrentUser(u);
                      router.push("/advertisers/dashboard");
                    }
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  デモ広告主でログイン
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = storage.getUserById(SAMPLE_IDS.userAffiliate);
                    if (u) {
                      setCurrentUser(u);
                      router.push("/affiliates/campaigns");
                    }
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  デモアフィ1（demoaff1）
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = storage.getUserById(SAMPLE_IDS.userAffiliate2);
                    if (u) {
                      setCurrentUser(u);
                      router.push("/affiliates/campaigns");
                    }
                  }}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  デモアフィ2（demoaff2）
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <p className="mt-12 text-sm text-slate-500">
        ※ 現在は localStorage によるプロトタイプです。データはブラウザ内に保存されます。
      </p>
    </main>
  );
}
