import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookmarks, notes } from "@/db/schema";
import { QuestionCard } from "@/components/question/QuestionCard";
import { QuestionPlayer } from "@/components/question/QuestionPlayer";
import { AttributionNote } from "@/components/question/AttributionNote";
import { BookmarkButton } from "@/components/question/BookmarkButton";
import { NoteEditor } from "@/components/question/NoteEditor";
import { getQuestionFull } from "@/server/queries/questions";
import { getCurrentUser } from "@/lib/currentUser";
import { isPro } from "@/lib/plan";

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
