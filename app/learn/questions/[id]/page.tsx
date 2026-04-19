import { notFound } from "next/navigation";
import { QuestionCard } from "@/components/question/QuestionCard";
import { QuestionPlayer } from "@/components/question/QuestionPlayer";
import { getQuestionFull } from "@/server/queries/questions";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const full = await getQuestionFull(id);
  if (!full) notFound();

  const { question, choices, topics, misconceptions, materials } = full;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <QuestionCard
        examYear={question.examYear}
        examSeason={question.examSeason}
        questionNumber={question.questionNumber}
        majorCategory={question.majorCategory}
        formatType={question.formatType}
        stem={question.stem}
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
        topics={topics}
        misconceptions={misconceptions}
        materials={materials}
      />
    </div>
  );
}
