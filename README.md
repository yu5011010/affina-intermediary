# Affina アフィリエイト（仲介サイト）プロトタイプ

**データは Supabase（Postgres）**。アプリからの読み書きは **Supabase JS + anon キー**（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`、EC と同じ形）。PostgREST 経由のため、マイグレーションで **anon ロールへの GRANT** が必要です（[`20260331140000_intermediary_anon_grants.sql`](supabase/migrations/20260331140000_intermediary_anon_grants.sql)）。**テーブル作成は Supabase CLI**（[`supabase/migrations/`](supabase/migrations/)）で行い、**テーブルが空のときだけ** [`lib/db/seed.ts`](lib/db/seed.ts) でサンプル投入。スキーマのソースは引き続き [`lib/db/schema.ts`](lib/db/schema.ts)（Drizzle 型定義）。ログイン表示用キャッシュのみブラウザ（`affina_intermediary_current_user`）に保持。

## Supabase CLI（マイグレーション）

プロジェクト直下に [`supabase/config.toml`](supabase/config.toml) があります。CLI は devDependency の `supabase` か、グローバルインストールのどちらでも可（以下は `npm run` 経由の例）。

### リモート（本番・クラウド）へ反映

```bash
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npm run db:push
```

`db:push` は `supabase db push` と同じです。初回・スキーマ変更のたびにリモート DB にマイグレーションが適用されます。

### ローカルで Postgres だけ動かす

```bash
npm run db:start
npm run db:status   # ローカル DB の起動確認（.env は NEXT_PUBLIC_SUPABASE_* をローカルスタック用に合わせる）
npm run db:reset    # migrations を適用（seed は無効。サンプルは Next 起動後に API 経由で投入）
```

止めるとき: `npm run db:stop`

### スキーマを変えたとき

1. [`lib/db/schema.ts`](lib/db/schema.ts) を編集  
2. `npm run db:generate` で `drizzle/` に SQL を生成（差分確認用）  
3. **新しいファイル**を `supabase/migrations/<タイムスタンプ>_説明.sql` として追加（中身は生成 SQL をベースに手で整理）  
4. `npm run db:push`（リモート）または `npm run db:reset`（ローカル）

`drizzle/` のマイグレーションは **アプリからは実行しません**（二重適用防止のため）。Drizzle はスキーマ定義・`db:generate` 用です。実行時のクエリは Supabase クライアントです。

### 型生成（任意）

リンク済みなら:

```bash
npx supabase gen types typescript --linked --schema public > lib/db/database.types.ts
```

## 起動

```bash
git clone https://github.com/yu5011010/affina-intermediary.git
cd affina-intermediary
npm install
cp .env.example .env.local
# 先に Supabase CLI で db push / ローカルなら db reset してテーブルを作る
# AFFINA_INBOUND_SECRET … EC の AFFINA_API_SECRET と同じ
# NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY … Project Settings → API（EC と同様）
npm run dev
```

- ポート: **3001**（EC は 3000）
- URL: http://localhost:3001

## Vercel（デプロイ済み）

本リポジトリは Vercel に接続済みです。

- **本番 URL**: https://intermediary.vercel.app  
- 購入通知エンドポイント: `https://intermediary.vercel.app/api/conversions`

**デプロイ前**に、手元で `npm run db:push`（または CI で Supabase にマイグレーションを流す）してテーブルを作成しておいてください。アプリはマイグレーションを自動実行しません。

[Vercel ダッシュボード](https://vercel.com/dashboard) → 該当プロジェクト → **Settings → Environment Variables** に以下を設定してください。

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | はい | Supabase プロジェクト URL。 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | はい | Supabase **anon** public key。PostgREST 経由で DB にアクセスします。 |
| `AFFINA_INBOUND_SECRET` | はい | EC の `AFFINA_API_SECRET` と**同じ値**。未設定のとき `/api/conversions` は 503 になります。 |

EC（Vercel など）側では `AFFINA_NOTIFICATION_URL` を  
`https://intermediary.vercel.app/api/conversions`  
にすると、チェックアウトから仲介へ通知できます。

**注意**: サンプルの広告主 `siteUrl` は `http://localhost:3000` です。本番 EC とアフィリンクをつなぐときは、広告主ダッシュボードで **サイト URL を本番の EC オリジン**に変更してください。

### EC からの購入通知 API

- `POST /api/conversions` … `Authorization: Bearer {AFFINA_INBOUND_SECRET}`、JSON body の項目は **EC（Affina Shop）リポジトリ**の `docs/ER_DIAGRAM.md`（通知 API 契約）を参照
- 解決できた場合は Supabase（PostgREST）経由で成果を 1 件 INSERT。レスポンスは `{ ok: true, persisted, conversionId }`

## サンプルデータ

**手動投入（推奨）** — `.env.local` に `NEXT_PUBLIC_SUPABASE_*` を入れたうえで:

```bash
npm run db:seed
```

入れ直す（仲介用テーブルを TRUNCATE してから同じサンプルを投入）:

```bash
npm run db:seed -- --force
```

**自動投入** — 上記を使わず、Next の API が初めて DB に触れたときも「ユーザー 0 件」なら [`lib/db/seed.ts`](lib/db/seed.ts) が同じサンプルを流します。

- アフィコード: `demoaff1`（ログインはトップのボタン）。案件は EC の先頭3商品に対応する3件のみ

## 機能

- **トップ** `/`: 広告主 / アフィリエイター登録の入口
- **新規登録** `/register`: 種別選択 → 登録フォーム
- **広告主** `/advertisers/dashboard`: **案件作成**（A8 の案件登録相当：案件名・LP URL・成果条件・承認条件・成果報酬）、merchant_id / api_secret 表示
- **アフィリエイター** `/affiliates/campaigns`: **案件一覧**・広告リンク（計測付き URL）発行
- **アフィリエイター** `/affiliates/dashboard`: 成果一覧、報酬合計

## ビルド

Turbopack では親ディレクトリのファイルが含まれるため、webpack でビルドしている。

```bash
npm run build
```

## データ

- **接続**: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`（`npm run db:ping` で確認可能）
- **マイグレーション（正）**: [`supabase/migrations/`](supabase/migrations/) を **Supabase CLI** で適用（`npm run db:push` / `npm run db:reset`）
- **Drizzle**: [`lib/db/schema.ts`](lib/db/schema.ts) が型・クエリのソース。[`drizzle/`](drizzle/) は `db:generate` の出力先（CLI 用 SQL を書くときの参考）
- **localStorage**: `affina_intermediary_current_user` のみ（ログイン表示用）
- ドメインモデルは EC 側 `docs/ER_DIAGRAM.md` の仲介プラットフォーム節と整合
- 案件の `externalProductId` はダミー UUID。**EC と疎通するには**、EC 側 Supabase の `products.id` を 1〜2 件コピーし、[`lib/sampleSeed.ts`](lib/sampleSeed.ts) か広告主ダッシュの案件を編集して一致させる。固定 ID の例: `http://localhost:3000/products/aaaaaaaa-aaaa-4aaa-8aaa-000000000001?ref=demoaff1&campaign_id={案件UUID}`（案件 UUID はアフィ案件詳細の「広告リンク」からコピー）
