# Affina アフィリエイト（仲介サイト）プロトタイプ

localStorage による仮実装。将来 Supabase に移行する前提で設計。

## 起動

```bash
git clone https://github.com/yu5011010/affina-intermediary.git
cd affina-intermediary
npm install
cp .env.example .env.local   # AFFINA_INBOUND_SECRET を設定（EC の AFFINA_API_SECRET と同じ）
npm run dev
```

- ポート: **3001**（EC は 3000）
- URL: http://localhost:3001

### EC からの購入通知 API

- `POST /api/conversions` … `Authorization: Bearer {AFFINA_INBOUND_SECRET}`、JSON body の項目は **EC（Affina Shop）リポジトリ**の `docs/ER_DIAGRAM.md`（通知 API 契約）を参照
- MVP は受信ログ + `{ ok: true }`。localStorage の成果一覧とは未連携

## サンプルデータ

初回（localStorage が空）に **広告主1・アフィ2名・案件5・成果4** が自動投入されます。

- アフィコード: `demoaff1` / `demoaff2`（ログインはトップのボタン）
- 再投入したいときは開発者ツールで `localStorage` の `affina_intermediary_db` を削除してリロード

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

- `localStorage` キー: `affina_intermediary_db`
- スキーマ: EC 側 `docs/ER_DIAGRAM.md` の仲介プラットフォーム節を参照
- **サンプルデータ**: localStorage が**完全に空**のとき、初回 `getDb` で自動注入（広告主1・アフィ2・案件5・成果4）。トップの「デモ〇〇でログイン」から試せる。
- サンプルをやり直す: DevTools で `affina_intermediary_db` と `affina_intermediary_current_user` を削除して再読み込み。
- 案件の `externalProductId` はダミー UUID。**EC と疎通するには**、`supabase db reset` 後に Supabase の `products.id` を 1〜2 件コピーし、[`lib/sampleSeed.ts`](lib/sampleSeed.ts) の `DEMO_PRODUCT_*` か広告主ダッシュの案件を編集して一致させる。`supabase db reset` 済みなら固定 ID で可: `http://localhost:3000/products/aaaaaaaa-aaaa-4aaa-8aaa-000000000001?ref=demoaff1&campaign_id={案件UUID}`（案件 UUID はアフィ案件詳細の「広告リンク」からコピー）
