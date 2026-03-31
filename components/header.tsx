"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUser,
  logout,
  type CurrentUser,
} from "@/lib/storage";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  const refreshUser = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    queueMicrotask(() => refreshUser());
    window.addEventListener("affina-user-changed", refreshUser);
    return () => window.removeEventListener("affina-user-changed", refreshUser);
  }, [refreshUser]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Affina アフィリエイト
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-slate-600 md:flex">
            <Link
              href="/register"
              className="text-slate-600 transition hover:text-slate-900"
            >
              新規登録
            </Link>
            {user?.advertiser && (
              <Link
                href="/advertisers/dashboard"
                className="text-slate-600 transition hover:text-slate-900"
              >
                広告主ダッシュボード
              </Link>
            )}
            {user?.affiliate && (
              <>
                <Link
                  href="/affiliates/campaigns"
                  className="text-slate-600 transition hover:text-slate-900"
                >
                  案件一覧
                </Link>
                <Link
                  href="/affiliates/dashboard"
                  className="text-slate-600 transition hover:text-slate-900"
                >
                  ダッシュボード
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            Supabase（Postgres）
          </span>
          {user ? (
            <>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                {user.displayName || user.email}
              </span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                {user.role === "advertiser" ? "広告主" : "アフィリエイター"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                ログアウト
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
