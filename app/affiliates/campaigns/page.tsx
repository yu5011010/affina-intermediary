"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { displayCaseName } from "@/lib/campaignLink";
import { getCurrentUser, storage } from "@/lib/storage";
import type { Advertiser, Affiliate, Campaign } from "@/lib/types";
import { CONVERSION_GOAL_LABELS } from "@/lib/types";

function formatCommission(c: Campaign): string {
  return c.commissionType === "percent"
    ? `${c.commissionRate}%`
    : `${c.commissionRate.toLocaleString()}円`;
}

export default function AffiliateCampaignsPage() {
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);

  useEffect(() => {
    void (async () => {
      const user = getCurrentUser();
      if (!user?.affiliate) {
        router.replace("/register?type=affiliate");
        return;
      }
      setAffiliate(user.affiliate);
      const [all, advs] = await Promise.all([
        storage.getCampaigns(),
        storage.getAdvertisers(),
      ]);
      setCampaigns(all.filter((c) => c.isActive));
      setAdvertisers(advs);
    })();
  }, [router]);

  const getAdvertiserName = (advertiserId: string) => {
    const a = advertisers.find((x) => x.id === advertiserId);
    return a?.siteName ?? "不明な広告主";
  };

  if (!affiliate) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-slate-600">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">案件一覧</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href="/affiliates/dashboard"
            className="text-slate-600 transition hover:text-slate-900"
          >
            ダッシュボード
          </Link>
          <Link href="/" className="text-slate-600 transition hover:text-slate-900">
            トップ
          </Link>
        </div>
      </div>

      <p className="mb-6 text-sm text-slate-600">
        宣伝したい案件を選び、「広告リンクを取得」から計測付きURL（LP
        へ誘導）を発行できます。A8 の案件選択に相当します。
      </p>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">案件がありません。</p>
          <p className="mt-2 text-sm text-slate-500">
            広告主が案件を登録すると、ここに表示されます。
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {campaigns.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {displayCaseName(c)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    広告主: {getAdvertiserName(c.advertiserId)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    成果条件:{" "}
                    {CONVERSION_GOAL_LABELS[c.conversionGoal ?? "purchase"]}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    成果報酬: {formatCommission(c)}
                  </p>
                  {c.approvalConditions ? (
                    <p className="mt-2 text-xs text-slate-500">
                      承認条件: {c.approvalConditions}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/affiliates/campaigns/${c.id}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  広告リンクを取得
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
