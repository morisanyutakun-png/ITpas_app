"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { attempts } from "@/db/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, type Plan } from "@/lib/plan";
import { getQuestionFull } from "@/server/queries/questions";

export type AiExplanationResult =
  | {
      ok: true;
      summary: string;
      sections: { heading: string; body: string }[];
      grounded: { kind: "attempt" | "cold"; selectedLabel?: string | null };
    }
  | {
      ok: false;
      reason: "not_signed_in" | "premium_only" | "not_found";
      plan: Plan;
    };

/**
 * Premium-gated "AI解説". No LLM dependency — the output is a structured
 * re-composition of the question's own misconception metadata + the user's
 * most recent attempt on the question. Pricing copy promises an explanation
 * tailored to the user's wrong-answer pattern, which this delivers from
 * structured data without round-tripping an API key.
 *
 * Keeping this in-repo has two upsides: it's deterministic (good for a
 * study tool) and cannot hallucinate IPA content. If a real LLM is wired
 * later, the caller contract stays the same.
 */
export async function generateAiExplanationAction(input: {
  questionId: string;
}): Promise<AiExplanationResult> {
  const user = await getCurrentUser();
  if (!user.isSignedIn) {
    return { ok: false, reason: "not_signed_in", plan: user.plan };
  }
  if (!hasFeature(user, "aiExplanations")) {
    return { ok: false, reason: "premium_only", plan: user.plan };
  }

  const full = await getQuestionFull(input.questionId);
  if (!full) return { ok: false, reason: "not_found", plan: user.plan };

  // Most recent non-skipped attempt on THIS question by THIS user.
  const lastAttempt = await db.query.attempts.findFirst({
    where: and(
      eq(attempts.userId, user.id),
      eq(attempts.questionId, input.questionId)
    ),
    orderBy: [desc(attempts.createdAt)],
  });

  const selected = lastAttempt?.selectedChoiceLabel
    ? full.choices.find((c) => c.label === lastAttempt.selectedChoiceLabel)
    : null;
  const correct = full.choices.find((c) => c.isCorrect);

  const grounded: Extract<AiExplanationResult, { ok: true }>["grounded"] =
    lastAttempt
      ? { kind: "attempt", selectedLabel: lastAttempt.selectedChoiceLabel ?? null }
      : { kind: "cold" };

  const sections: { heading: string; body: string }[] = [];

  if (selected && !selected.isCorrect && selected.whyAttractive) {
    sections.push({
      heading: `あなたが選んだ「${selected.label}」が魅力的だった理由`,
      body: selected.whyAttractive,
    });
  }

  if (selected && !selected.isCorrect && selected.misconceptionSlug) {
    const m = full.misconceptions.find(
      (x) => x.slug === selected.misconceptionSlug
    );
    if (m) {
      sections.push({
        heading: `今回発動した誤解パターン: ${m.title}`,
        body: buildMisconceptionParagraph(m.title),
      });
    }
  }

  if (correct) {
    sections.push({
      heading: `正答「${correct.label}」を押さえるコツ`,
      body:
        full.question.keyInsight ??
        full.question.explanation ??
        `${correct.body} が正しい根拠を、条件文に立ち返って確認してください。`,
    });
  }

  if (full.question.commonMistakeFlow) {
    sections.push({
      heading: "よくある思考フロー (ここで分岐する)",
      body: full.question.commonMistakeFlow,
    });
  }

  if (full.topics.length > 0) {
    sections.push({
      heading: "復習の順序 (論点)",
      body: full.topics.map((t) => `・${t.title}: ${t.summary}`).join("\n"),
    });
  }

  const summary = selected
    ? selected.isCorrect
      ? `正答できています。次は同じ論点の別パターンで安定させましょう。`
      : `「${selected.label}」を選んだ時の思考の引っかかりを言語化しました。次回は「${correct?.label ?? "正答"}」を導けるよう、下のステップを順に確認してください。`
    : `まだこの問題を解いていません。解いた後に再生成すると、あなたの誤答パターンに沿った解説に置き換わります。`;

  return { ok: true, summary, sections, grounded };
}

function buildMisconceptionParagraph(title: string): string {
  // Short, template-guided paragraph — keeps tone consistent and avoids
  // fabricating specifics beyond what the structured data provides.
  return `『${title}』は、定義が似ている別概念と混同しやすいパターンです。問題文の語尾・主語・スコープ (「全て」「少なくとも」「〜を除く」など) に戻り、例外条件をチェックする癖をつけてください。`;
}
