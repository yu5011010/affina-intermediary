"use client";

import type {
  Advertiser,
  Affiliate,
  Campaign,
  Conversion,
  ConversionGoal,
  DbSchema,
  IntermediaryUser,
} from "./types";
import { buildSampleDb, isDbEmpty } from "./sampleSeed";
import {
  generateApiSecret,
  generateId,
  generateMerchantId,
  generateShortCode,
} from "./utils";

const STORAGE_KEY = "affina_intermediary_db";
const CURRENT_USER_KEY = "affina_intermediary_current_user";

function emptyDb(): DbSchema {
  return {
    users: [],
    advertisers: [],
    affiliates: [],
    campaigns: [],
    conversions: [],
  };
}

function normalizeDb(parsed: unknown): DbSchema {
  const p = parsed as Partial<DbSchema>;
  return {
    users: Array.isArray(p.users) ? p.users : [],
    advertisers: Array.isArray(p.advertisers) ? p.advertisers : [],
    affiliates: Array.isArray(p.affiliates) ? p.affiliates : [],
    campaigns: Array.isArray(p.campaigns) ? p.campaigns : [],
    conversions: Array.isArray(p.conversions) ? p.conversions : [],
  };
}

function getDb(): DbSchema {
  if (typeof window === "undefined") {
    return emptyDb();
  }
  let db: DbSchema;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    db = emptyDb();
  } else {
    try {
      db = normalizeDb(JSON.parse(raw));
    } catch {
      db = emptyDb();
    }
  }
  if (isDbEmpty(db)) {
    db = buildSampleDb();
    setDb(db);
  }
  return db;
}

function setDb(db: DbSchema): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ----- 抽象層（将来 Supabase に差し替え可能） -----

export const storage = {
  getUsers(): IntermediaryUser[] {
    return getDb().users;
  },

  getAdvertisers(): Advertiser[] {
    return getDb().advertisers;
  },

  getAffiliates(): Affiliate[] {
    return getDb().affiliates;
  },

  getCampaigns(): Campaign[] {
    return getDb().campaigns;
  },

  getConversions(): Conversion[] {
    return getDb().conversions;
  },

  getUserById(id: string): IntermediaryUser | undefined {
    return getDb().users.find((u) => u.id === id);
  },

  getAdvertiserByUserId(userId: string): Advertiser | undefined {
    return getDb().advertisers.find((a) => a.userId === userId);
  },

  getAffiliateByUserId(userId: string): Affiliate | undefined {
    return getDb().affiliates.find((a) => a.userId === userId);
  },

  getAffiliateByCode(code: string): Affiliate | undefined {
    return getDb().affiliates.find((a) => a.affiliateCode === code);
  },

  getCampaignsByAdvertiser(advertiserId: string): Campaign[] {
    return getDb().campaigns.filter((c) => c.advertiserId === advertiserId);
  },

  getCampaignById(id: string): Campaign | undefined {
    return getDb().campaigns.find((c) => c.id === id);
  },

  getConversionsByAffiliate(affiliateId: string): Conversion[] {
    return getDb().conversions.filter((c) => c.affiliateId === affiliateId);
  },

  createUser(data: {
    email: string;
    displayName: string;
    role: "advertiser" | "affiliate";
  }): IntermediaryUser {
    const db = getDb();
    const user: IntermediaryUser = {
      id: generateId(),
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    setDb(db);
    return user;
  },

  createAdvertiser(data: {
    userId: string;
    siteName: string;
    siteUrl: string;
  }): Advertiser {
    const db = getDb();
    const advertiser: Advertiser = {
      id: generateId(),
      userId: data.userId,
      merchantId: generateMerchantId(),
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      apiSecret: generateApiSecret(),
      status: "approved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.advertisers.push(advertiser);
    setDb(db);
    return advertiser;
  },

  createAffiliate(data: { userId: string; payoutInfo?: string }): Affiliate {
    const db = getDb();
    let code = generateShortCode();
    while (db.affiliates.some((a) => a.affiliateCode === code)) {
      code = generateShortCode();
    }
    const affiliate: Affiliate = {
      id: generateId(),
      userId: data.userId,
      affiliateCode: code,
      status: "approved",
      payoutInfo: data.payoutInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.affiliates.push(affiliate);
    setDb(db);
    return affiliate;
  },

  createCampaign(data: {
    advertiserId: string;
    externalProductId: string;
    caseName: string;
    lpUrl?: string;
    conversionGoal: ConversionGoal;
    approvalConditions?: string;
    productName?: string;
    commissionRate: number;
    commissionType: "percent" | "fixed";
  }): Campaign {
    const db = getDb();
    const campaign: Campaign = {
      id: generateId(),
      advertiserId: data.advertiserId,
      externalProductId: data.externalProductId,
      caseName: data.caseName.trim(),
      lpUrl: data.lpUrl?.trim() || undefined,
      conversionGoal: data.conversionGoal,
      approvalConditions: data.approvalConditions?.trim() || undefined,
      productName: data.productName?.trim() || undefined,
      commissionRate: data.commissionRate,
      commissionType: data.commissionType,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.campaigns.push(campaign);
    setDb(db);
    return campaign;
  },

  updateCampaign(
    campaignId: string,
    patch: {
      externalProductId?: string;
      lpUrl?: string | null;
      isActive?: boolean;
    },
  ): Campaign | null {
    const db = getDb();
    const idx = db.campaigns.findIndex((c) => c.id === campaignId);
    if (idx === -1) {
      return null;
    }
    const c = { ...db.campaigns[idx] };
    if (patch.externalProductId !== undefined) {
      c.externalProductId = patch.externalProductId.trim();
    }
    if (patch.lpUrl !== undefined) {
      const t = patch.lpUrl?.trim();
      c.lpUrl = t || undefined;
    }
    if (patch.isActive !== undefined) {
      c.isActive = patch.isActive;
    }
    c.updatedAt = new Date().toISOString();
    db.campaigns[idx] = c;
    setDb(db);
    return c;
  },

  createConversion(data: {
    affiliateId: string;
    campaignId: string;
    externalOrderId: string;
    merchantId: string;
    amount: number;
  }): Conversion {
    const db = getDb();
    const conversion: Conversion = {
      id: generateId(),
      affiliateId: data.affiliateId,
      campaignId: data.campaignId,
      externalOrderId: data.externalOrderId,
      merchantId: data.merchantId,
      amount: data.amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    db.conversions.push(conversion);
    setDb(db);
    return conversion;
  },
};

// ----- 現在ログイン中のユーザー（localStorage） -----

export type CurrentUser = IntermediaryUser & {
  advertiser?: Advertiser;
  affiliate?: Affiliate;
};

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CurrentUser;
    const db = getDb();
    const user = db.users.find((u) => u.id === parsed.id);
    if (!user) return null;
    const advertiser = db.advertisers.find((a) => a.userId === user.id);
    const affiliate = db.affiliates.find((a) => a.userId === user.id);
    return {
      ...user,
      advertiser: advertiser ?? undefined,
      affiliate: affiliate ?? undefined,
    };
  } catch {
    return null;
  }
}

export function setCurrentUser(user: IntermediaryUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new CustomEvent("affina-user-changed"));
}

export function logout(): void {
  setCurrentUser(null);
}
