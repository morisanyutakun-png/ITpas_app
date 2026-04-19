import Link from "next/link";
import { ArrowRight, Skull, Target, BookOpen, Zap, Check, X } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16">
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
