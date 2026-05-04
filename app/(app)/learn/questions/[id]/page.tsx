import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ChevronLeft, Crown, Lock } from "lucide-react";
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
import { getMisconceptionArchetype } from "@/server/content/misconceptionArchetypeMap";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [full, user] = await Promise.all([
    getQuestionFull(id),
    getCurrentUser(),
  ]);
  if (!full) notFound();

  const { question, choices, topics, misconceptions, materials } = full;
  const allowed = await isYearAllowed(user.plan, question.examYear);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-grad-purple p-8 text-center text-white shadow-hero">
          <div className="relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/30 backdrop-blur">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-[22px] font-semibold tracking-tight">
              この問題は Premium 限定
            </h1>
            <p className="mt-1.5 text-[13px] opacity-90">
              令和{question.examYear}年度は {planLabel(user.plan)} では未解放です。
              Premium で全年度のアーカイブに。
            </p>
            <Link
              href="/pricing?reason=year_locked"
              className="mt-5 inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-semibold text-foreground shadow-ios active:opacity-90"
            >
              <Crown className="h-4 w-4" />
              Premium を見る
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
        </div>
      </div>
    );
  }

  const [bookmarkRow, noteRow] = await Promise.all([
    db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, user.id),
        eq(bookmarks.questionId, question.id)
      ),
    }),
    db.query.notes.findFirst({
      where: and(
        eq(notes.userId, user.id),
        eq(notes.questionId, question.id)
      ),
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      {/* ── Thin editorial breadcrumb/toolbar ─────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground active:opacity-70"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="kicker !mt-0">Question Detail</span>
        </Link>
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
        key={question.id}
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
        misconceptions={misconceptions.map((m) => ({
          ...m,
          archetype: getMisconceptionArchetype(m.slug),
        }))}
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
