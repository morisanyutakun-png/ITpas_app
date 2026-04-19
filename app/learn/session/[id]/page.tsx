import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { QuestionCard } from "@/components/question/QuestionCard";
import { QuestionPlayer } from "@/components/question/QuestionPlayer";
import { Button } from "@/components/ui/button";
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
      <div className="space-y-4">
        <p>このセッションには出題できる問題がありません。</p>
        <Button asChild>
          <Link href="/learn">学習ハブへ戻る</Link>
        </Button>
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          セッション {step} / {ids.length}
        </span>
        <span>{s.mode} モード</span>
      </div>
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
