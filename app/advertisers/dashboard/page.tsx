"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { displayCaseName } from "@/lib/campaignLink";
import { getCurrentUser, storage } from "@/lib/storage";
import type { Advertiser, Campaign, ConversionGoal } from "@/lib/types";
import { CONVERSION_GOAL_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function CampaignEcProductIdEditor({
  campaign,
  onSaved,
}: {
  campaign: Campaign;
  onSaved: () => void;
}) {
  const [val, setVal] = useState(campaign.externalProductId);

  useEffect(() => {
    setVal(campaign.externalProductId);
  }, [campaign.id, campaign.externalProductId]);

  return (
    <div className="mt-3 rounded border border-slate-100 bg-slate-50/80 p-3">
      <label className="mb-1 block text-xs font-medium text-slate-600">
        EC 商品 ID（Supabase の products.id と一致）
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="min-w-[16rem] flex-1 rounded border border-slate-300 px-2 py-1.5 font-mono text-xs"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => {
            storage.updateCampaign(campaign.id, { externalProductId: val });
            onSaved();
          }}
          className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
        >
          保存
        </button>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        アフィリンクの <code className="rounded bg-white px-0.5">/products/…</code>{" "}
        に使われます。seed で固定 UUID が付かなかった場合は、EC で開いている実 ID に直してください。
      </p>
    </div>
  );
}

export default function AdvertisersDashboardPage() {
  const router = useRouter();
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [caseName, setCaseName] = useState("");
  const [lpUrl, setLpUrl] = useState("");
  const [conversionGoal, setConversionGoal] =
    useState<ConversionGoal>("purchase");
  const [approvalConditions, setApprovalConditions] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [commissionRate, setCommissionRate] = useState(10);
  const [commissionType, setCommissionType] = useState<"percent" | "fixed">(
    "percent"
  );

  const refreshCampaigns = useCallback(() => {
    const user = getCurrentUser();
    if (user?.advertiser) {
      setCampaigns(storage.getCampaignsByAdvertiser(user.advertiser.id));
    }
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.advertiser) {
      router.replace("/register?type=advertiser");
      return;
    }
    setAdvertiser(user.advertiser);
    refreshCampaigns();
  }, [router, refreshCampaigns]);

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertiser || !productId.trim() || !caseName.trim()) return;
    storage.createCampaign({
      advertiserId: advertiser.id,
      externalProductId: productId.trim(),
      caseName: caseName.trim(),
      lpUrl: lpUrl.trim() || undefined,
      conversionGoal,
      approvalConditions: approvalConditions.trim() || undefined,
      productName: productName.trim() || undefined,
      commissionRate,
      commissionType,
    });
    refreshCampaigns();
    setCaseName("");
    setLpUrl("");
    setConversionGoal("purchase");
    setApprovalConditions("");
    setProductId("");
    setProductName("");
    setCommissionRate(10);
    setCommissionType("percent");
  };

  if (!advertiser) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-slate-600">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">広告主ダッシュボード</h1>
        <Link
          href="/"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          トップに戻る
        </Link>
      </div>

      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">API 認証情報</h2>
        <p className="mb-2 text-sm text-slate-600">
          EC サイトから通知 API を呼び出す際に使用します。外部に漏らさないでください。
        </p>
        <div className="space-y-2 font-mono text-sm">
          <div className="rounded bg-slate-100 p-3">
            <span className="text-slate-600">merchant_id: </span>
            <span className="text-slate-900">{advertiser.merchantId}</span>
          </div>
          <div className="rounded bg-slate-100 p-3">
            <span className="text-slate-600">api_secret: </span>
            <span className="text-slate-900">{advertiser.apiSecret}</span>
          </div>
        </div>
      </section>

      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          案件作成（キャンペーン）
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          A8 の「商品登録＝案件作成」に相当する項目です。LP
          URL を空にすると、EC の商品ページ（/products/商品ID）へ誘導するリンクになります。
        </p>

        <form onSubmit={handleAddCampaign} className="mb-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              案件名 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="例：プロテイン定期購入"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">LP URL（遷移先）</label>
            <input
              type="url"
              value={lpUrl}
              onChange={(e) => setLpUrl(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="https://example.com/lp/protein（任意・未入力で商品ページ）"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              成果条件
            </label>
            <select
              value={conversionGoal}
              onChange={(e) =>
                setConversionGoal(e.target.value as ConversionGoal)
              }
              className="w-full max-w-xs rounded border border-slate-300 px-3 py-2 text-sm"
            >
              {(Object.keys(CONVERSION_GOAL_LABELS) as ConversionGoal[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {CONVERSION_GOAL_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">承認条件</label>
            <textarea
              value={approvalConditions}
              onChange={(e) => setApprovalConditions(e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="例：初回購入のみ／返品後は無効 など"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                成果報酬
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={commissionType}
                  onChange={(e) =>
                    setCommissionType(e.target.value as "percent" | "fixed")
                  }
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="percent">%</option>
                  <option value="fixed">固定額（円）</option>
                </select>
                <input
                  type="number"
                  min={0}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-28 rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                EC 商品 ID（通知 API 照合用） <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="product-uuid"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">
              表示用メモ（任意・旧「商品名」）
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="アフィリエイター向け補足など"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            案件を追加
          </button>
        </form>

        <h3 className="mb-3 text-base font-semibold text-slate-900">案件一覧</h3>
        {campaigns.length === 0 ? (
          <p className="text-slate-500">案件はまだありません</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {campaigns.map((c) => (
              <li key={c.id} className="py-4">
                <div className="font-medium text-slate-900">
                  {displayCaseName(c)}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span>
                    成果:{" "}
                    {CONVERSION_GOAL_LABELS[c.conversionGoal ?? "purchase"]}
                  </span>
                  <span>
                    報酬:{" "}
                    {c.commissionType === "percent"
                      ? `${c.commissionRate}%`
                      : `${c.commissionRate}円`}
                  </span>
                  {c.lpUrl ? (
                    <span className="truncate max-w-full" title={c.lpUrl}>
                      LP: {c.lpUrl}
                    </span>
                  ) : (
                    <span>LP: 商品ページ（自動）</span>
                  )}
                </div>
                {c.approvalConditions ? (
                  <p className="mt-1 text-xs text-slate-500">
                    承認条件: {c.approvalConditions}
                  </p>
                ) : null}
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span
                    className={
                      c.isActive
                        ? "rounded bg-emerald-100 px-2 py-0.5 text-emerald-800"
                        : "rounded bg-slate-100 px-2 py-0.5"
                    }
                  >
                    {c.isActive ? "有効" : "無効"}
                  </span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
                <CampaignEcProductIdEditor campaign={c} onSaved={refreshCampaigns} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">登録情報</h2>
        <p className="text-sm text-slate-600">{advertiser.siteName}</p>
        <p className="text-sm text-slate-600">{advertiser.siteUrl}</p>
      </section>
    </main>
  );
}
