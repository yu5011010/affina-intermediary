"use client";

import type {
  Advertiser,
  Affiliate,
  Campaign,
  Conversion,
  ConversionGoal,
  CurrentUserProfile,
  IntermediaryUser,
} from "./types";

const CURRENT_USER_KEY = "affina_intermediary_current_user";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = text.trim() || res.statusText || "リクエストに失敗しました";
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j.error === "string" && j.error.length > 0) {
        msg = j.error;
      }
    } catch {
      if (text.startsWith("<")) {
        msg = `サーバーが HTML を返しました（${res.status}）。.env.local の NEXT_PUBLIC_SUPABASE_* やターミナルログを確認してください。`;
      }
    }
    throw new Error(`${res.status} ${msg}`);
  }
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("API の応答が JSON ではありません");
  }
}

export type CurrentUser = CurrentUserProfile;

export const storage = {
  async getUserById(id: string): Promise<IntermediaryUser | undefined> {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      return undefined;
    }
    return parseJson<IntermediaryUser>(res);
  },

  async findUserByEmail(
    email: string,
  ): Promise<IntermediaryUser | undefined> {
    const res = await fetch(
      `/api/users?email=${encodeURIComponent(email)}`,
    );
    if (res.status === 404) {
      return undefined;
    }
    return parseJson<IntermediaryUser>(res);
  },

  async getAdvertisers(): Promise<Advertiser[]> {
    return parseJson<Advertiser[]>(await fetch("/api/advertisers"));
  },

  async getAffiliateByUserId(userId: string): Promise<Affiliate | undefined> {
    const res = await fetch(
      `/api/affiliates?userId=${encodeURIComponent(userId)}`,
    );
    if (res.status === 404) {
      return undefined;
    }
    return parseJson<Affiliate>(res);
  },

  async getAdvertiserByUserId(
    userId: string,
  ): Promise<Advertiser | undefined> {
    const res = await fetch(
      `/api/advertisers?userId=${encodeURIComponent(userId)}`,
    );
    if (res.status === 404) {
      return undefined;
    }
    return parseJson<Advertiser>(res);
  },

  async getCampaigns(): Promise<Campaign[]> {
    return parseJson<Campaign[]>(await fetch("/api/campaigns"));
  },

  async getCampaignsByAdvertiser(advertiserId: string): Promise<Campaign[]> {
    return parseJson<Campaign[]>(
      await fetch(
        `/api/campaigns?advertiserId=${encodeURIComponent(advertiserId)}`,
      ),
    );
  },

  async getCampaignById(id: string): Promise<Campaign | undefined> {
    const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      return undefined;
    }
    return parseJson<Campaign>(res);
  },

  async getConversionsByAffiliate(
    affiliateId: string,
  ): Promise<Conversion[]> {
    return parseJson<Conversion[]>(
      await fetch(
        `/api/conversions?affiliateId=${encodeURIComponent(affiliateId)}`,
      ),
    );
  },

  async createUser(data: {
    email: string;
    displayName: string;
    role: "advertiser" | "affiliate";
  }): Promise<IntermediaryUser> {
    return parseJson<IntermediaryUser>(
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  },

  async createAdvertiser(data: {
    userId: string;
    siteName: string;
    siteUrl: string;
  }): Promise<Advertiser> {
    return parseJson<Advertiser>(
      await fetch("/api/advertisers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  },

  async createAffiliate(data: {
    userId: string;
    payoutInfo?: string;
  }): Promise<Affiliate> {
    return parseJson<Affiliate>(
      await fetch("/api/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  },

  async createCampaign(data: {
    advertiserId: string;
    externalProductId: string;
    caseName: string;
    lpUrl?: string;
    conversionGoal: ConversionGoal;
    approvalConditions?: string;
    productName?: string;
    commissionRate: number;
    commissionType: "percent" | "fixed";
  }): Promise<Campaign> {
    return parseJson<Campaign>(
      await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  },

  async updateCampaign(
    campaignId: string,
    patch: {
      externalProductId?: string;
      lpUrl?: string | null;
      isActive?: boolean;
    },
  ): Promise<Campaign | null> {
    const res = await fetch(`/api/campaigns/${encodeURIComponent(campaignId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.status === 404) {
      return null;
    }
    return parseJson<Campaign>(res);
  },

  async createConversion(data: {
    affiliateId: string;
    campaignId: string;
    externalOrderId: string;
    merchantId: string;
    amount: number;
  }): Promise<Conversion> {
    return parseJson<Conversion>(
      await fetch("/api/conversions/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  },
};

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export async function setCurrentUser(
  user: IntermediaryUser | null,
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent("affina-user-changed"));
    return;
  }
  const res = await fetch(`/api/users/${encodeURIComponent(user.id)}/current`);
  if (!res.ok) {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent("affina-user-changed"));
    return;
  }
  const full = (await res.json()) as CurrentUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(full));
  window.dispatchEvent(new CustomEvent("affina-user-changed"));
}

export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new CustomEvent("affina-user-changed"));
}
