import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { QuestionCard } from "@/components/question/QuestionCard";
import { QuestionPlayer } from "@/components/question/QuestionPlayer";
import { SessionProgressBar } from "@/components/session/SessionProgressBar";
import { getOrCreateAnonUser } from "@/lib/anonId";
import { getQuestionFull } from "@/server/queries/questions";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const step = sp.step ? Math.max(1, Number(sp.step)) : 1;

  const user = await getOrCreateAnonUser();
  const s = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });
  if (!s || s.userId !== user.id) notFound();

  const ids = (s.questionIds as unknown as string[]) ?? [];
  if (ids.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center space-y-3">
        <p className="text-slate-700">このセッションには出題できる問題がありません。</p>
        <Link
          href="/learn"
          className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white"
        >
          学習ハブへ戻る
        </Link>
      </div>
    );
  }

  if (step > ids.length) {
    redirect(`/learn/session/${id}/result`);
  }

  const currentId = ids[step - 1];
  const full = await getQuestionFull(currentId);
  if (!full) notFound();

  const nextHref =
    step < ids.length
      ? `/learn/session/${id}?step=${step + 1}`
      : `/learn/session/${id}/result`;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <SessionProgressBar step={step} total={ids.length} mode={s.mode} />
      <QuestionCard
        examYear={full.question.examYear}
        examSeason={full.question.examSeason}
        questionNumber={full.question.questionNumber}
        majorCategory={full.question.majorCategory}
        formatType={full.question.formatType}
        stem={full.question.stem}
      />
      <QuestionPlayer
        questionId={full.question.id}
        choices={full.choices.map((c) => ({
          label: c.label,
          body: c.body,
          isCorrect: c.isCorrect,
          whyAttractive: c.whyAttractive,
          misconceptionSlug: c.misconceptionSlug,
        }))}
        explanation={full.question.explanation}
        topics={full.topics}
        misconceptions={full.misconceptions}
        materials={full.materials}
        nextHref={nextHref}
        sessionId={id}
      />
    </div>
  );
}
