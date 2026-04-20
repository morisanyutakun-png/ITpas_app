import { AlertTriangle } from "lucide-react";

const MESSAGES: Record<string, string> = {
  state_mismatch:
    "ログイン状態の検証に失敗しました。Cookieがブロックされていないか、ブラウザのプライベートモードを使っていないかを確認してもう一度お試しください。",
  missing_code: "Googleからのコード取得に失敗しました。もう一度お試しください。",
  no_email: "Googleアカウントからメールアドレスを取得できませんでした。メールの共有を許可して再度ログインしてください。",
  access_denied: "ログインがキャンセルされました。",
};

export function AuthErrorBanner({ code }: { code: string }) {
  const known = MESSAGES[code];
  return (
    <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <div className="font-bold">ログインに失敗しました</div>
          <div>{known ?? `エラー: ${code}`}</div>
          <div className="text-xs text-rose-700">
            解決しない場合は、環境変数 <code className="rounded bg-rose-100 px-1">AUTH_SECRET</code> /
            <code className="ml-1 rounded bg-rose-100 px-1">GOOGLE_CLIENT_ID</code> /
            <code className="ml-1 rounded bg-rose-100 px-1">GOOGLE_CLIENT_SECRET</code> が設定されているか、Google Consoleのリダイレクト URI が現在のドメインと一致しているか確認してください。
          </div>
        </div>
      </div>
    </div>
  );
}
