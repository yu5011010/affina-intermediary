"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildAffiliateLink,
  displayCaseName,
} from "@/lib/campaignLink";
import { getCurrentUser, storage } from "@/lib/storage";
import type { Advertiser, Affiliate, Campaign } from "@/lib/types";
import { CONVERSION_GOAL_LABELS } from "@/lib/types";

function formatCommission(c: Campaign): string {
  return c.commissionType === "percent"
    ? `${c.commissionRate}%`
    : `${c.commissionRate.toLocaleString()}円`;
}

export default function AffiliateCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);

  useEffect(() => {
    void (async () => {
      const user = getCurrentUser();
      if (!user?.affiliate) {
        router.replace("/register?type=affiliate");
        return;
      }
      setAffiliate(user.affiliate);

      const c = await storage.getCampaignById(id);
      if (!c || !c.isActive) {
        setCampaign(null);
        setAdvertiser(null);
        return;
      }
      setCampaign(c);
      const advs = await storage.getAdvertisers();
      const adv = advs.find((a) => a.id === c.advertiserId);
      setAdvertiser(adv ?? null);
    })();
  }, [id, router]);

  const affiliateLink = useMemo(() => {
    if (!affiliate || !campaign || !advertiser?.siteUrl) return "";
    return buildAffiliateLink(campaign, advertiser, affiliate.affiliateCode);
  }, [affiliate, campaign, advertiser]);

  if (!affiliate) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-slate-600">読み込み中...</p>
      </main>
    );
  }

  if (!campaign || !advertiser) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="mb-4 text-slate-600">案件が見つかりません。</p>
        <Link
          href="/affiliates/campaigns"
          className="text-emerald-600 hover:underline"
        >
          案件一覧に戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/affiliates/campaigns"
          className="text-sm text-emerald-700 hover:underline"
        >
          他の案件
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        {displayCaseName(campaign)}
      </h1>
      <p className="mb-2 text-slate-600">広告主: {advertiser.siteName}</p>
      <ul className="mb-6 space-y-1 text-sm text-slate-600">
        <li>
          成果条件:{" "}
          {CONVERSION_GOAL_LABELS[campaign.conversionGoal ?? "purchase"]}
        </li>
        <li>成果報酬: {formatCommission(campaign)}</li>
        {campaign.approvalConditions ? (
          <li>承認条件: {campaign.approvalConditions}</li>
        ) : null}
        <li>
          遷移先（ベース）:{" "}
          {campaign.lpUrl?.trim()
            ? campaign.lpUrl
            : `${advertiser.siteUrl.replace(/\/$/, "")}/products/${campaign.externalProductId}`}
          <span className="block text-xs text-slate-500">
            下の広告リンクには <code className="rounded bg-slate-100 px-1">ref</code> と{" "}
            <code className="rounded bg-slate-100 px-1">campaign_id</code>（この案件の
            ID）が自動付与されます。
          </span>
        </li>
      </ul>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          広告リンク（計測付き URL）
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          A8 の広告リンク生成に相当します。クリックで LP（または EC 商品ページ）へ流入し、
          <code className="rounded bg-slate-100 px-1">ref</code>（アフィコード）と{" "}
          <code className="rounded bg-slate-100 px-1">campaign_id</code>（案件 ID）が
          クエリに付き、EC 側で Cookie に保存されます。
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={affiliateLink}
            readOnly
            className="min-w-0 flex-1 rounded border border-slate-300 bg-slate-50 px-4 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(affiliateLink);
              alert("コピーしました");
            }}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            コピー
          </button>
          {affiliateLink.startsWith("http") ? (
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
            >
              EC を別タブで開く
            </a>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          EC で「商品が見つかりません」と出るときは、ローカルで{" "}
          <code className="rounded bg-slate-100 px-1">supabase db reset</code>{" "}
          済みか、商品 ID が seed の固定 UUID と一致しているか確認してください。
        </p>
      </section>
    </main>
  );
}
