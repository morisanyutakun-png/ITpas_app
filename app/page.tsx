import Link from "next/link";
import { ArrowRight, Skull, Target, Zap, Check, X, Flame, Bookmark, Compass, PlayCircle } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { isPro } from "@/lib/plan";
import { getLastAttempt, getPersonalSummary } from "@/server/queries/personal";
import { getRecommendation } from "@/server/queries/history";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const sp = await searchParams;
  const user = await readCurrentUser();
  const showPersonal = !!user?.isSignedIn;
  const [summary, last, rec] = showPersonal
    ? await Promise.all([
        getPersonalSummary(user!.id),
        getLastAttempt(user!.id),
        getRecommendation(user!.id),
      ])
    : [null, null, null];
  const pro = isPro(user);

  return (
    <div className="space-y-16">
      {sp.auth_error && <AuthErrorBanner code={sp.auth_error} />}
      {showPersonal && summary && (
        <section className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                こんにちは、{user.displayName ?? user.email?.split("@")[0] ?? "学習者"}さん
              </div>
              <div className="text-lg font-bold text-slate-900">
                {pro ? "Proプランで進行中" : "Freeプランで進行中"}
              </div>
            </div>
            {!pro && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow"
              >
                <Zap className="h-3 w-3" />
                Proへ
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniStat icon={Flame} tone="rose" label="連続学習" value={`${summary.streakDays}日`} />
            <MiniStat
              icon={Target}
              tone="violet"
              label="累計回答"
              value={summary.totalAttempts.toString()}
            />
            <MiniStat
              icon={Check}
              tone="emerald"
              label="正答率"
              value={
                summary.totalAttempts > 0
                  ? `${Math.round((summary.correctAttempts / summary.totalAttempts) * 100)}%`
                  : "—"
              }
            />
            <MiniStat
              icon={Bookmark}
              tone="amber"
              label="保存した問題"
              value={summary.bookmarkCount.toString()}
            />
          </div>

          <div className="mt-5 grid md:grid-cols-2 gap-3">
            {last && (
              <Link
                href={
                  last.sessionId
                    ? `/learn/session/${last.sessionId}`
                    : `/learn/questions/${last.questionId}`
                }
                className="group flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    続きから
                  </div>
                  <div className="text-sm font-bold text-slate-900 line-clamp-1">
                    {last.sessionId ? "前回のセッションへ戻る" : "直前に解いた問題へ"}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
              </Link>
            )}
            {rec && (
              <Link
                href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
                className="group flex items-center gap-3 rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 transition hover:border-violet-400"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-violet-700">
                    {rec.reason} — おすすめ5問
                  </div>
                  <div className="text-sm font-bold text-slate-900 line-clamp-1">
                    {rec.title}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-700" />
              </Link>
            )}
          </div>
        </section>
      )}

      {!showPersonal && (
        <section className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-900">
                Googleでログインすると端末をまたいで進捗保存
              </div>
              <div className="text-xs text-slate-600">
                ブックマーク / 連続学習日数 / 弱点レコメンド / 続きから再開
              </div>
            </div>
            <Link
              href="/api/auth/google/login?returnTo=/"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              ログイン
            </Link>
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 px-6 py-12 md:px-12 md:py-16 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200">
            <Zap className="h-3.5 w-3.5" />
            理解特化型 / IT パスポート
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            「過去問は解けるけど、<br />
            <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              なぜ間違えたか
            </span>
            は説明できない」<br />
            を、終わらせる。
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            選んだ誤答ごとに「なぜ魅力的に見えたか」を提示。
            単元別ではなく <strong className="text-white">『誤解パターン』</strong> で苦手が積み上がる、新しい過去問体験。
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/learn/random"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-900 shadow-lg transition hover:bg-amber-300 hover:shadow-xl"
            >
              ランダムに1問解く
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/learn/session/new?mode=weakness&count=5"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              弱点5問チャレンジ
            </Link>
            <Link
              href="/learn/questions?origin=actual"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              公式過去問を見る
            </Link>
          </div>
        </div>
      </section>

      {/* What you actually see — visual sample */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
            <Target className="h-3.5 w-3.5" />
            実際の体験
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            誤答した瞬間に <span className="text-amber-600">"敵"</span> が現れる
          </h2>
          <p className="text-slate-600">
            あなたを引き寄せた誤解パターンが顔を出すから、丸暗記が壊れる。
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          {/* Mini choice tiles preview */}
          <SampleChoice label="ア" body="送信者は共通鍵で署名する。" wrong selected />
          <SampleChoice label="イ" body="送信者は秘密鍵で署名し、受信者は公開鍵で検証する。" correct />

          {/* Boss reveal preview */}
          <div className="rounded-2xl border-2 border-amber-400 overflow-hidden shadow-xl mt-4">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-2 flex items-center gap-2 text-white">
              <Skull className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                ENEMY ENCOUNTER — あなたを引き寄せたワナ
              </span>
            </div>
            <div className="bg-amber-50 px-5 py-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-xl font-black text-white shadow">
                ア
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  なぜこの選択肢が魅力的に見えたか
                </div>
                <p className="text-sm text-slate-800">
                  暗号化のイメージで共通鍵を選びがち。だがデジタル署名は『本人性』を示すため、誰でも検証できる必要があり、鍵を共有する共通鍵は使えない。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="grid md:grid-cols-3 gap-4">
        <Pillar
          tag="差別化①"
          title="誤答ごとの『魅力理由』"
          body="毎問、選んだ誤答が魅力的に見えた理由を提示。3つの誤答すべてに用意。"
          gradient="from-amber-500 to-orange-500"
        />
        <Pillar
          tag="差別化②"
          title="誤解パターン別ヒートマップ"
          body="単元ではなく『どの誤解で落ちているか』が色で見える。"
          gradient="from-violet-500 to-fuchsia-500"
        />
        <Pillar
          tag="差別化③"
          title="比較表/補助資料に1タップ"
          body="似た用語、擬似言語、表計算の参照ルールへ問題からそのまま飛べる。"
          gradient="from-emerald-500 to-teal-500"
        />
      </section>
    </div>
  );
}

function SampleChoice({
  label,
  body,
  selected,
  correct,
  wrong,
}: {
  label: string;
  body: string;
  selected?: boolean;
  correct?: boolean;
  wrong?: boolean;
}) {
  const labelColor = correct
    ? "bg-emerald-500"
    : wrong
      ? "bg-rose-500"
      : selected
        ? "bg-blue-500"
        : "bg-slate-300";
  const border = correct
    ? "border-emerald-500 ring-2 ring-emerald-400 shadow-lg bg-emerald-50"
    : wrong
      ? "border-rose-500 ring-2 ring-rose-400 shadow-lg bg-rose-50"
      : "border-slate-200";
  return (
    <div className={`flex overflow-hidden rounded-xl border-2 ${border}`}>
      <div className={`flex w-14 shrink-0 items-center justify-center text-2xl font-black text-white ${labelColor}`}>
        {label}
      </div>
      <div className="flex flex-1 items-center justify-between gap-3 px-4 py-4 bg-white/0">
        <span className="text-sm">{body}</span>
        {correct && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-4 w-4" strokeWidth={3} />
          </div>
        )}
        {wrong && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white">
            <X className="h-4 w-4" strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Flame;
  tone: "violet" | "emerald" | "rose" | "amber";
  label: string;
  value: string;
}) {
  const palette = {
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  }[tone];
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${palette}`}>
          <Icon className="h-3 w-3" />
        </span>
        {label}
      </div>
      <div className="mt-1 text-xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function Pillar({
  tag,
  title,
  body,
  gradient,
}: {
  tag: string;
  title: string;
  body: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg">
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition`}
      />
      <div className="relative space-y-3">
        <div className={`inline-flex rounded-full bg-gradient-to-r ${gradient} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white`}>
          {tag}
        </div>
        <h3 className="text-lg font-bold leading-snug">{title}</h3>
        <p className="text-sm text-slate-600">{body}</p>
      </div>
    </div>
  );
}
