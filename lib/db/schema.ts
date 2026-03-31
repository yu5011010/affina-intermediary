import {
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const intermediaryUsers = pgTable(
  "intermediary_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [uniqueIndex("intermediary_users_email_unique").on(t.email)],
);

export const advertisers = pgTable("advertisers", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => intermediaryUsers.id),
  merchantId: text("merchant_id").notNull(),
  siteName: text("site_name").notNull(),
  siteUrl: text("site_url").notNull(),
  apiSecret: text("api_secret").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const affiliates = pgTable(
  "affiliates",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => intermediaryUsers.id),
    affiliateCode: text("affiliate_code").notNull(),
    status: text("status").notNull(),
    payoutInfo: text("payout_info"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [uniqueIndex("affiliates_code_unique").on(t.affiliateCode)],
);

export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  advertiserId: text("advertiser_id")
    .notNull()
    .references(() => advertisers.id),
  externalProductId: text("external_product_id").notNull(),
  caseName: text("case_name"),
  lpUrl: text("lp_url"),
  conversionGoal: text("conversion_goal"),
  approvalConditions: text("approval_conditions"),
  productName: text("product_name"),
  commissionRate: integer("commission_rate").notNull(),
  commissionType: text("commission_type").notNull(),
  isActive: boolean("is_active").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const conversions = pgTable("conversions", {
  id: text("id").primaryKey(),
  affiliateId: text("affiliate_id")
    .notNull()
    .references(() => affiliates.id),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id),
  externalOrderId: text("external_order_id").notNull(),
  merchantId: text("merchant_id").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});
