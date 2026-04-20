import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { Crown, Lock } from "lucide-react";
import { db } from "@/db/client";
import { bookmarks, notes } from "@/db/schema";
import { QuestionCard } from "@/components/question/QuestionCard";
import { QuestionPlayer } from "@/components/question/QuestionPlayer";
import { AttributionNote } from "@/components/question/AttributionNote";
import { BookmarkButton } from "@/components/question/BookmarkButton";
import { NoteEditor } from "@/components/question/NoteEditor";
import { AiExplanationPanel } from "@/components/question/AiExplanationPanel";
import { getQuestionFull } from "@/server/queries/questions";
import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro, isYearAllowed, planLabel } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [full, user] = await Promise.all([getQuestionFull(id), getCurrentUser()]);
  if (!full) notFound();

  const { question, choices, topics, misconceptions, materials } = full;

  const allowed = await isYearAllowed(user.plan, question.examYear);
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-white p-8 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold">
          この問題 (令和{question.examYear}年度) はPremium限定です
        </h1>
        <p className="text-sm text-slate-600">
          現在のプラン: <strong>{planLabel(user.plan)}</strong>。
          Premiumでは過去全年度の問題アーカイブが開放されます。
        </p>
        <Link
          href="/pricing?reason=year_locked"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 font-bold text-white"
        >
          <Crown className="h-4 w-4" />
          Premiumを見る
        </Link>
      </div>
    );
  }

  const [bookmarkRow, noteRow] = await Promise.all([
    db.query.bookmarks.findFirst({
      where: and(eq(bookmarks.userId, user.id), eq(bookmarks.questionId, question.id)),
    }),
    db.query.notes.findFirst({
      where: and(eq(notes.userId, user.id), eq(notes.questionId, question.id)),
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-end">
        <BookmarkButton
          questionId={question.id}
          initialBookmarked={!!bookmarkRow}
          signedIn={user.isSignedIn}
        />
      </div>
      <QuestionCard
        examYear={question.examYear}
        examSeason={question.examSeason}
        questionNumber={question.questionNumber}
        majorCategory={question.majorCategory}
        formatType={question.formatType}
        stem={question.stem}
        originType={question.originType}
      />
      <QuestionPlayer
        questionId={question.id}
        choices={choices.map((c) => ({
          label: c.label,
          body: c.body,
          isCorrect: c.isCorrect,
          whyAttractive: c.whyAttractive,
          misconceptionSlug: c.misconceptionSlug,
        }))}
        explanation={question.explanation}
        keyInsight={question.keyInsight}
        commonMistakeFlow={question.commonMistakeFlow}
        topics={topics}
        misconceptions={misconceptions}
        materials={materials}
      />
      <AiExplanationPanel
        questionId={question.id}
        unlocked={hasFeature(user, "aiExplanations")}
        plan={user.plan}
      />
      <NoteEditor
        questionId={question.id}
        initialBody={noteRow?.body ?? ""}
        signedIn={user.isSignedIn}
        isPro={isPro(user)}
      />
      <AttributionNote
        originType={question.originType}
        sourceNote={question.sourceNote}
        modifiedNote={question.modifiedNote}
      />
    </div>
  );
}
