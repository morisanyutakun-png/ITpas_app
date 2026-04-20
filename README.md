# ITパス理解ノート

> 「過去問は解けるけど、なぜ間違えたかは説明できない」を終わらせる。ITパスポート向けの理解特化型学習Webアプリ。

## 何が違うか

- 各誤答選択肢に **「なぜ魅力的に見えたか」** の説明
- 単元別ではなく **「誤解パターン別」** ヒートマップ
- 論点・比較表・補助資料へその場で1タップ
- 苦手な誤解パターンに絞った再出題
- Googleアカウントでログイン、端末をまたいで進捗保存

## 料金モデル (フリーミアム)

| | Free | Pro |
|---|---|---|
| 1日の回答数 | 10問 | 無制限 |
| 誤答の魅力理由表示 | ○ | ○ |
| セッション最大サイズ | 5問 | 100問 |
| 詳細ヒートマップ / 日次分析 | ✕ | ○ |
| 模擬試験モード (100問/120分) | ✕ | ○ |
| ブックマーク | 3件 | 無制限 |
| 問題ノート | ✕ | 無制限 |
| 学習レポートPDF書き出し | ✕ | ○ |

Pro: ¥780/月 or ¥6,800/年 (年払いで約27%お得)。

料金の編集は `src/lib/plan.ts` の `PLAN_LIMITS` / `PRO_PRICE_JPY_*` で一元管理されています。

## 技術スタック

- Next.js 15 (App Router, Server Actions)
- TypeScript / Tailwind CSS / shadcn-flavor UI
- Drizzle ORM + Neon Postgres (HTTP driver)
- Vercel デプロイ前提

---

## ローカル開発

### 0. 前提

- Node.js 20+ (`.nvmrc` は 22)
- npm（または pnpm でも可）
- [Neon](https://neon.tech) のアカウント (無料枠でOK)

### 1. セットアップ

```bash
git clone <YOUR_REPO_URL> itpas_app
cd itpas_app
npm install
```

### 2. Neon DB + Google OAuth + (任意) Stripe を用意

1. [Neon](https://neon.tech) のプロジェクトを作成 → **Pooled connection** URL をコピー
2. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) で OAuth 2.0 クライアントIDを発行
   - Authorized redirect URI: `http://localhost:3000/api/auth/google/callback` (本番URLも追加)
3. `AUTH_SECRET` は `openssl rand -base64 48` で生成
4. (任意) Stripe の Subscription Price を2つ作成 (月額 / 年額) し `STRIPE_PRICE_PRO_*` に設定
5. `.env.local` を作成

```bash
cp .env.example .env.local
# DATABASE_URL / AUTH_SECRET / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET を埋める
```

### 3. スキーマ適用 + サンプル投入

```bash
npm run db:push          # drizzle-kit push: テーブル作成
npm run validate:content # zod + 参照整合性チェック
npm run seed             # content/structured/** → DB
```

### 4. 起動

```bash
npm run dev
# http://localhost:3000 → /learn/questions で1問解いてみる
```

### 5. 元PDFを置く（オプション）

リポジトリには PDF は含まれません（`.gitignore` で除外）。ローカルに置く場合は [content/raw/README.md](content/raw/README.md) を参照。

---

## Vercel デプロイ

### A. GitHubに push

```bash
git remote add origin git@github.com:<your-account>/itpas_app.git
git push -u origin main
```

### B. Vercel プロジェクト作成

1. https://vercel.com/new にアクセス
2. リポジトリを Import (**Framework: Next.js** が自動検出される)
3. **Environment Variables** に以下を追加（Production / Preview / Development すべて）
   - `DATABASE_URL`: Neon の **Pooled connection** URL
   - `NEXT_PUBLIC_SITE_URL`（任意）: カスタムドメインを当てた後の絶対URL（未設定なら `$VERCEL_URL` にフォールバック）
4. Deploy → 数分で公開

### C. 本番DBに初回スキーマ + サンプル投入

ビルド時に DB は変更されません。**ローカルから本番Neonに対して** 一度だけ実行します。

```bash
# .env.local の DATABASE_URL を本番(Neon)の Pooled URLに差し替えるか、
# 一時的に DATABASE_URL を環境変数で指定して実行:
DATABASE_URL="postgres://...prod..." npm run db:push
DATABASE_URL="postgres://...prod..." npm run seed
```

> **注意**: Neon は無料プランでも本番運用に十分ですが、自動サスペンドが効きます。初回アクセスで起動に1〜2秒かかることがあります。

### D. 動作確認

- `/` → ランディング
- `/learn/questions` → 3問表示
- 1問選んで誤答 → `WhyAttractiveCard` が出るか
- `/dashboard` → ヒートマップが表示されるか

---

## 運用ルール（必読）

詳細は [CLAUDE.md](./CLAUDE.md)。要点:

- **DB直編集禁止**。常に `content/structured/` を編集 → `npm run seed`
- 新規問題には **必ず `whyAttractive` を全誤答に書く**（差別化の中核）
- `slug` / `externalKey` は一度決めたら変えない（外部キーになる）
- `npm run validate:content` をPR前に通す

## 問題を1問追加する手順

```bash
cp content/structured/questions/r05_q01.json \
   content/structured/questions/r05_q03.json
# 編集（externalKey, stem, choices, whyAttractive など）

npm run validate:content      # zod検証
npm run seed                  # DBへupsert (本番Neonに向ければ本番反映)
```

## ディレクトリ

```
content/
├── raw/                         # 元PDF (gitignore)
│   ├── past_exams/
│   └── references/
└── structured/                  # ★アプリの真実
    ├── questions/*.json
    ├── topics/*.json
    ├── misconceptions/*.json
    └── materials/*.md

app/                             # Next.js App Router
src/
├── db/                          # Drizzle schema + client
├── server/                      # queries / actions / selection
├── components/                  # question / dashboard / ui
└── lib/                         # anonId, markdown, site, utils
scripts/
├── seed.ts
└── validate_structured.ts
drizzle/migrations/              # `db:generate` で生成
```

## スクリプト

```bash
npm run dev               # 開発サーバ
npm run build             # 本番ビルド
npm run start             # 本番起動 (Vercel不要時のみ)
npm run db:generate       # スキーマ変更 → SQL生成
npm run db:push           # スキーマをNeonへ適用
npm run db:studio         # Drizzle Studio
npm run validate:content  # 構造化データ検証
npm run seed              # DBへupsert
```

## 現在のMVP状態

- ✅ スキーマ (13テーブル + relations + indexes)
- ✅ サンプル: 3問 / 論点3 / 誤解3 / 補助資料3 — **stemはプレースホルダ**。PDFを開いて差し替え推奨
- ✅ 画面: LP / 一覧 / 1問演習 / セッション / 結果 / 論点 / 誤解 / 補助資料 / ダッシュボード
- ✅ SEO: metadata / robots / sitemap / OG画像
- ✅ エラーハンドリング: not-found / error / loading
- ⏳ 認証 / AI補助 / 模試モード / PDF抽出 → 将来

## ライセンス

ITパスポート試験の問題は IPA (情報処理推進機構) の著作物です。本サイトは学習目的で構造化・解説しています。
