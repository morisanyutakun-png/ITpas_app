# CLAUDE.md — ITパス理解ノート 開発ガイド

このリポジトリは ITパスポート向け「理解特化型」学習Webアプリです。Claude Code/人間の双方が触ります。以下のルールを守ってください。

## アーキテクチャの真実

- **Source of Truth は `content/structured/`** — DBはここからの派生物。
  - DBに直接 INSERT/UPDATE しない。 `content/structured/` を編集して `pnpm seed` を実行する。
  - 変更履歴は Git で追える。DB差分は不可逆になりがち。
- **Next.js App Router + Server Actions/Server Components 中心**。
  - 読み取り: Server Component から `src/server/queries/*` を直接呼ぶ。
  - 書き込み: Server Action (`src/server/actions/*`)。
  - 外部からfetchが必要な場合のみ Route Handler (`app/api/*`)。
- **Drizzle ORM + Neon Postgres**。マイグレーションは `pnpm db:generate` → `pnpm db:push`。
- **ユーザ解決**: 常に `getCurrentUser()` (`@/lib/currentUser`) を使う。
  - 署名済みセッションCookie (`itpas_session`) が最優先。Google OAuth でサインイン済みならここに入る。
  - 無ければ匿名Cookie (`itpas_anon_key`) から `users` 行を引く/作る。
  - Googleでサインインすると匿名行は `signInWithGoogle` が自動マージする (attempts/sessions/bookmarks/notes)。
  - 旧 `getOrCreateAnonUser` は back-compat シム。新規コードは `getCurrentUser()` を直接使う。
- **マネタイズ**: `users.plan` が `free` / `pro`。制限は `src/lib/plan.ts` の `PLAN_LIMITS` に集約。
  - Free: 1日10問 / セッション最大5問 / ブックマーク3件 / 高度分析・模擬試験・PDF出力 不可。
  - 日次上限ゲートは `recordAttemptAction` が持つ (JSTで日付判定)。
  - 新しい制限を入れるなら PLAN_LIMITS を触ること。DBフラグは増やさない。
  - Stripe 連携は `src/lib/stripe.ts` が fetch ベース (`stripe` npm依存なし)。
    Webhook は `app/api/stripe/webhook/route.ts` で `STRIPE_WEBHOOK_SECRET` を使い署名検証。

## 絶対のルール（コンテンツ品質）

1. 新しい問題を追加するときは **`whyAttractive` を全ての誤答選択肢に書く**（空欄禁止）。これがアプリの差別化の中核。
2. `slug` (topics/misconceptions/materials) と `externalKey` (questions) は**一度決めたら変更しない**。外部キーとして使われている。
3. 新規問題を入れる前に `pnpm validate:content` を通す。zodスキーマと参照整合性を検証する。
4. 過去問PDFのページ番号 (`sourcePageNumber`) は1始まりでPDFの実ページに合わせる。
5. PDFをそのまま画像表示するUIを足さない。問題は構造化して保存する。

## 開発コマンド

```bash
pnpm install
cp .env.example .env.local             # DATABASE_URL / AUTH_SECRET / GOOGLE_* を入れる
pnpm db:generate                       # スキーマ変更時
pnpm db:push                           # マイグレーション適用 (0004_monetization.sql を含む)
pnpm validate:content                  # 構造化データの整合性チェック
pnpm seed                              # content/structured/** → DB
pnpm dev                               # http://localhost:3000
```

### Google OAuth セットアップ

1. https://console.cloud.google.com/apis/credentials で OAuth 2.0 クライアントIDを作成。
2. Authorized redirect URI に `http://localhost:3000/api/auth/google/callback` と本番のURLを登録。
3. `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を `.env.local` に入れる。
4. `AUTH_SECRET` は `openssl rand -base64 48` などで生成 (32文字以上必須)。

## 新しい問題を1問足す手順

1. `content/structured/questions/r05_q03.json` を作る（既存ファイルをコピーして編集）
2. 必要なら `topics/`, `misconceptions/`, `materials/` に新しい slug を追加
3. `pnpm validate:content`
4. `pnpm seed`
5. `/learn/questions/[id]` で動作確認

## 新しい誤解パターンを足す手順

1. `content/structured/misconceptions/<slug>.json` を作る
2. 既存の問題で関連するものは `misconceptionSlugs` と choice の `misconceptionSlug` を更新
3. seed → ダッシュボードのヒートマップに反映される

## 将来の自動化フック（まだ実装しない）

- `scripts/extract_pdf.ts` — pdf-parse で `content/extracted/r07_raw.txt` を生成
- LLM下書き → `content/structured/questions/*.json` を**人間レビュー前提で**生成
- 出力形式は手動構造化と完全一致させる（フォーマットを変えない）

## 注意

- 1画面の情報密度を上げすぎない。問題演習中は「今見るべきものだけ」。
- AIチャットを主役にしない。解説は人間が書いた本文を使う。
- 派手なゲーミフィケーションを足さない。
