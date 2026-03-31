import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL?.trim()) {
  console.warn(
    "drizzle-kit: DATABASE_URL が未設定です。Supabase の接続 URI を .env または .env.local に設定してください。",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres",
  },
});
