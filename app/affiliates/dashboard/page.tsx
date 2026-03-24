"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { displayCaseName } from "@/lib/campaignLink";
import { getCurrentUser, storage } from "@/lib/storage";
import type { Affiliate, Campaign, Conversion } from "@/lib/types";
import { formatDateTime, formatYen } from "@/lib/utils";

export default function AffiliatesDashboardPage() {
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.affiliate) {
      router.replace("/register?type=affiliate");
      return;
    }
    setAffiliate(user.affiliate);
    setConversions(storage.getConversionsByAffiliate(user.affiliate.id));
    setCampaigns(storage.getCampaigns());
  }, [router]);

  const totalAmount = useMemo(
    () =>
      conversions
        .filter((c) => c.status === "approved" || c.status === "paid")
        .reduce((sum, c) => sum + c.amount, 0),
    [conversions]
  );

  const pendingAmount = useMemo(
    () =>
      conversions
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + c.amount, 0),
    [conversions]
  );

  const getCampaignName = (campaignId: string) => {
    const c = campaigns.find((x) => x.id === campaignId);
    return c ? displayCaseName(c) : campaignId;
  };

  const handleAddTestConversion = () => {
    if (!affiliate || campaigns.length === 0) {
      alert(
        "広告主がキャンペーンを1件以上作成する必要があります。まず広告主で登録し、キャンペーンを追加してください。"
      );
      return;
    }
    const campaign = campaigns[0];
    const advertiser = storage.getAdvertisers().find((a) => a.id === campaign.advertiserId);
    const merchantId = advertiser?.merchantId ?? "test";
    const conversion = storage.createConversion({
      affiliateId: affiliate.id,
      campaignId: campaign.id,
      externalOrderId: `test-${Date.now()}`,
      merchantId,
      amount: Math.floor(Math.random() * 5000) + 500,
    });
    setConversions((prev) => [...prev, conversion]);
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          アフィリエイターダッシュボード
        </h1>
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
          トップに戻る
        </Link>
      </div>

      <section className="mb-10 rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          案件から広告リンクを発行
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          A8 と同様、案件一覧から LP への計測付き URL を取得できます。
        </p>
        <Link
          href="/affiliates/campaigns"
          className="inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          案件一覧へ
        </Link>
      </section>

      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-sm text-slate-600">確定報酬合計</h3>
          <p className="text-2xl font-bold text-emerald-600">
            {formatYen(totalAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-sm text-slate-600">審査中</h3>
          <p className="text-2xl font-bold text-amber-600">
            {formatYen(pendingAmount)}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">成果一覧</h2>
          <button
            type="button"
            onClick={handleAddTestConversion}
            className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            テスト成果を追加
          </button>
        </div>
        {conversions.length === 0 ? (
          <p className="text-slate-500">
            成果はまだありません。案件の広告リンクを共有して成果が発生するとここに表示されます。
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {conversions.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <span className="font-medium text-slate-900">
                    {getCampaignName(c.campaignId)}
                  </span>
                  <span className="ml-2 text-sm text-slate-500">
                    注文: {c.externalOrderId.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">
                    {formatYen(c.amount)}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      c.status === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : c.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : c.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.status === "pending"
                      ? "審査中"
                      : c.status === "approved"
                        ? "確定"
                        : c.status === "paid"
                          ? "支払済"
                          : "却下"}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  {formatDateTime(c.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
