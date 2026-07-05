# ウメパウ

梅田のキレイなトイレ&パウダールームを口コミで探せるマップアプリ。

- 地図（Leaflet + OpenStreetMap）と一覧の連動表示
- カテゴリ（駅・百貨店・商業施設など）とタグでの絞り込み
- 誰でも口コミを投稿でき、一覧にない施設は地図クリックで新規登録できる
- UIは [SmartHR Design System](https://smarthr.design/)（smarthr-ui）準拠

## 技術構成

| 領域 | 技術 |
|---|---|
| フロントエンド | React 18 + TypeScript + Vite |
| UI | smarthr-ui v96（ブランド色のみ上書き） |
| 地図 | Leaflet + OpenStreetMap |
| データ | Supabase（未設定時はlocalStorageにフォールバック） |

## セットアップ

```bash
npm install
cp .env.example .env.local   # SupabaseのURLとanonキーを設定
npm run dev
```

`.env.local` が未設定でも起動でき、その場合の投稿データはブラウザ内（localStorage）のみに保存されます。

## Supabase

スキーマは `supabase/migrations/` で管理しています。

```bash
supabase link --project-ref <PROJECT_REF> --workdir .
supabase db push --workdir .
```

テーブルは `reviews`（口コミ）と `user_spots`（ユーザー追加施設）。RLSで匿名ロールにselect/insertのみ許可しています（update/delete不可）。

## デプロイ（Vercel）

1. このリポジトリをGitHubへpush
2. Vercelで「Import Project」→ フレームワークはVite（自動検出）
3. 環境変数に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定
4. Deploy

## データについて

初期掲載の26施設は口コミ投稿の要約に基づくナレッジです（`src/data.ts`）。座標は概算値のため、現地確認で随時更新してください。除外判断の記録は同ファイルの `EXCLUDED_ENTRIES` にあります。
