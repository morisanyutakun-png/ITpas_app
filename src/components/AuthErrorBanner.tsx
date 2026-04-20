import { AlertTriangle } from "lucide-react";

type Hint = { message: string; followup: string };

const KNOWN: Record<string, Hint> = {
  state_mismatch: {
    message:
      "ログイン状態の検証に失敗しました。Cookieがブロックされていないか、ブラウザのプライベートモードを使っていないかを確認してもう一度お試しください。",
    followup: "それでも直らない場合は、AUTH_SECRET がデプロイ全体で同一の値になっているか確認してください。",
  },
  missing_code: {
    message: "Googleからのコード取得に失敗しました。",
    followup: "もう一度お試しください。",
  },
  no_email: {
    message: "Googleアカウントからメールアドレスを取得できませんでした。",
    followup: "メールの共有を許可して再度ログインしてください。",
  },
  access_denied: {
    message: "ログインがキャンセルされました。",
    followup: "",
  },
};

function hintFor(code: string): Hint {
  if (KNOWN[code]) return KNOWN[code];

  const lower = code.toLowerCase();

  // DB schema out of sync
  if (lower.includes("does not exist") && lower.includes("column")) {
    return {
      message: "データベースのスキーマが最新ではありません。",
      followup:
        "本番DBに対して `npm run db:apply:raw` を実行してマイグレーションを適用してください (0004_monetization.sql / 0005_premium_tier.sql)。",
    };
  }
  // AUTH_SECRET missing
  if (lower.includes("auth_secret")) {
    return {
      message: "AUTH_SECRET 環境変数が未設定または短すぎます。",
      followup: "`openssl rand -base64 48` で生成した32文字以上の文字列を Vercel の環境変数に登録してください。",
    };
  }
  // Google OAuth credentials
  if (lower.includes("google_client")) {
    return {
      message: "Google OAuth の認証情報が未設定です。",
      followup: "Google Cloud Console で発行した `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を Vercel の環境変数に登録してください。",
    };
  }
  // Invalid redirect URI
  if (lower.includes("redirect_uri")) {
    return {
      message: "Google の承認済みリダイレクト URI が現在のドメインと一致していません。",
      followup:
        "Google Cloud Console → 認証情報 → OAuth 2.0 クライアント ID の『承認済みのリダイレクト URI』に現在のドメインの `/api/auth/google/callback` を追加してください。",
    };
  }

  return {
    message: `エラー: ${code}`,
    followup: "",
  };
}

export function AuthErrorBanner({ code }: { code: string }) {
  const hint = hintFor(code);
  return (
    <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <div className="font-bold">ログインに失敗しました</div>
          <div>{hint.message}</div>
          {hint.followup && <div className="text-xs text-rose-700">{hint.followup}</div>}
        </div>
      </div>
    </div>
  );
}
