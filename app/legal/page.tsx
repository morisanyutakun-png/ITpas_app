import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "著作権・引用について",
  description:
    "本サイトでの IPA ITパスポート試験問題の引用方針、著作権の取扱い、オリジナル問題の表示について。",
};

export default function LegalPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-8 text-slate-800">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">著作権・引用について</h1>
        <p className="text-sm text-slate-600">最終更新: 2026-04</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">1. 公開過去問の引用</h2>
        <p className="leading-relaxed">
          本サイトに掲載している「<strong>IPA過去問</strong>」バッジが付いた問題は、
          独立行政法人 情報処理推進機構 (IPA) が
          <Link
            href="https://www.ipa.go.jp/shiken/mondai-kaiotu/ip_questions.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-700 underline mx-1"
          >
            公開している過去問題
          </Link>
          を、著作権法第32条（引用）に基づき学習目的で引用しています。
        </p>
        <p className="leading-relaxed">
          各問題ページの末尾に、出典（年度・問番号）を明記しています。
          原典の問題文・選択肢の著作権は IPA に帰属します。
          解説・誤答解析（『なぜ魅力的に見えたか』）・関連論点・補助資料は本サイト独自の創作物です。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">2. オリジナル問題</h2>
        <p className="leading-relaxed">
          紫色の「<strong>オリジナル</strong>」バッジが付いた問題は、
          IPA ITパスポート試験の出題範囲・頻出論点を元に、本サイトが独自に作成したものです。
          実際の過去問の文言とは異なります。「R5範囲 #1」のような表記は
          『令和5年度の出題範囲に対応するオリジナル問題1番』を意味します。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">3. 解説・図解の著作権</h2>
        <p className="leading-relaxed">
          解説本文、補助資料 (比較表・チートシート)、誤解パターンの定義、
          UI・デザインは本サイトの著作物です。
          無断転載・商用利用はご遠慮ください。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">4. 削除・修正のご要望</h2>
        <p className="leading-relaxed">
          引用方法に問題がある、もしくは引用の取り下げをご希望の場合は、
          GitHub Issues またはメールにてご連絡ください。速やかに対応いたします。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">5. 免責</h2>
        <p className="leading-relaxed">
          本サイトの問題・解説は学習補助を目的としています。
          試験合格や資格取得を保証するものではありません。
          内容の正確性には努めていますが、最新の試験範囲・公式解答については
          IPA 公式情報をご確認ください。
        </p>
      </section>
    </article>
  );
}
