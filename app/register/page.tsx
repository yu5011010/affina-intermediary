"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { storage, setCurrentUser } from "@/lib/storage";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialType =
    typeParam === "advertiser" || typeParam === "affiliate"
      ? typeParam
      : "advertiser";

  const [type, setType] = useState<"advertiser" | "affiliate">(initialType);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [payoutInfo, setPayoutInfo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!displayName.trim()) {
      setError("表示名を入力してください");
      return;
    }
    if (type === "advertiser" && (!siteName.trim() || !siteUrl.trim())) {
      setError("サイト名とURLを入力してください");
      return;
    }

    try {
      const existingUser = await storage.findUserByEmail(email.trim());
      if (existingUser) {
        const hasAdvertiser = await storage.getAdvertiserByUserId(
          existingUser.id,
        );
        const hasAffiliate = await storage.getAffiliateByUserId(
          existingUser.id,
        );
        if (type === "advertiser" && hasAdvertiser) {
          setError("このメールアドレスは既に広告主として登録されています");
          return;
        }
        if (type === "affiliate" && hasAffiliate) {
          setError(
            "このメールアドレスは既にアフィリエイターとして登録されています",
          );
          return;
        }
        if (type === "advertiser" && hasAffiliate) {
          setError(
            "このメールアドレスはアフィリエイターとして登録済みです。別のメールで広告主登録してください。",
          );
          return;
        }
        if (type === "affiliate" && hasAdvertiser) {
          setError(
            "このメールアドレスは広告主として登録済みです。別のメールでアフィリエイター登録してください。",
          );
          return;
        }
      }

      let user = existingUser;
      if (!user) {
        user = await storage.createUser({
          email: email.trim(),
          displayName: displayName.trim(),
          role: type,
        });
      }

      if (type === "advertiser") {
        await storage.createAdvertiser({
          userId: user.id,
          siteName: siteName.trim(),
          siteUrl: siteUrl.trim(),
        });
      } else {
        await storage.createAffiliate({
          userId: user.id,
          payoutInfo: payoutInfo.trim() || undefined,
        });
      }

      await setCurrentUser(user);
      setSuccess("登録が完了しました");
      setTimeout(() => {
        if (type === "advertiser") {
          router.push("/advertisers/dashboard");
        } else {
          router.push("/affiliates/campaigns");
        }
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "登録に失敗しました。再試行してください。",
      );
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">新規登録</h1>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setType("advertiser")}
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
            type === "advertiser"
              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          広告主
        </button>
        <button
          type="button"
          onClick={() => setType("affiliate")}
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
            type === "affiliate"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          アフィリエイター
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-slate-700">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="displayName"
            className="mb-1 block text-sm text-slate-700"
          >
            表示名
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="太郎"
          />
        </div>

        {type === "advertiser" && (
          <>
            <div>
              <label
                htmlFor="siteName"
                className="mb-1 block text-sm text-slate-700"
              >
                サイト名
              </label>
              <input
                id="siteName"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="マイショップ"
              />
            </div>
            <div>
              <label
                htmlFor="siteUrl"
                className="mb-1 block text-sm text-slate-700"
              >
                サイトURL
              </label>
              <input
                id="siteUrl"
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>
          </>
        )}

        {type === "affiliate" && (
          <div>
            <label
              htmlFor="payoutInfo"
              className="mb-1 block text-sm text-slate-700"
            >
              振込先（任意）
            </label>
            <input
              id="payoutInfo"
              type="text"
              value={payoutInfo}
              onChange={(e) => setPayoutInfo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="銀行名・口座番号など"
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800"
        >
          {type === "advertiser" ? "広告主として登録" : "アフィリエイターとして登録"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/" className="text-indigo-600 hover:underline">
          トップに戻る
        </Link>
      </p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">読み込み中...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
