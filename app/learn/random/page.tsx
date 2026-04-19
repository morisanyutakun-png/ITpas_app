import Link from "next/link";
import { redirect } from "next/navigation";
import { pickRandomQuestionId } from "@/server/queries/random";

export const dynamic = "force-dynamic";

export default async function RandomQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ origin?: string; major?: string }>;
}) {
  const sp = await searchParams;
  const origin =
    sp.origin === "actual"
      ? "ipa_actual"
      : sp.origin === "inspired"
        ? "ipa_inspired"
        : undefined;
  const major =
    sp.major === "strategy" || sp.major === "management" || sp.major === "technology"
      ? sp.major
      : undefined;

  const id = await pickRandomQuestionId({ originType: origin, majorCategory: major });

  if (!id) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center space-y-3 max-w-md mx-auto">
        <p className="text-slate-700">該当する問題が見つかりませんでした。</p>
        <Link href="/learn" className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white">
          学習ハブへ
        </Link>
      </div>
    );
  }

  redirect(`/learn/questions/${id}`);
}
