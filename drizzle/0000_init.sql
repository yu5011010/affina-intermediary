CREATE TABLE "advertisers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"merchant_id" text NOT NULL,
	"site_name" text NOT NULL,
	"site_url" text NOT NULL,
	"api_secret" text NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"affiliate_code" text NOT NULL,
	"status" text NOT NULL,
	"payout_info" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"advertiser_id" text NOT NULL,
	"external_product_id" text NOT NULL,
	"case_name" text,
	"lp_url" text,
	"conversion_goal" text,
	"approval_conditions" text,
	"product_name" text,
	"commission_rate" integer NOT NULL,
	"commission_type" text NOT NULL,
	"is_active" boolean NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversions" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"external_order_id" text NOT NULL,
	"merchant_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intermediary_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "advertisers" ADD CONSTRAINT "advertisers_user_id_intermediary_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."intermediary_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_intermediary_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."intermediary_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_advertiser_id_advertisers_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."advertisers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "affiliates_code_unique" ON "affiliates" USING btree ("affiliate_code");--> statement-breakpoint
CREATE UNIQUE INDEX "intermediary_users_email_unique" ON "intermediary_users" USING btree ("email");