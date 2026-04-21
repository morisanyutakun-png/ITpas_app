import { redirect } from "next/navigation";
import { createSessionAction } from "@/server/actions/sessions";
import type { OriginTypeFilter } from "@/server/selection/weaknessSelector";

export const dynamic = "force-dynamic";

/**
 * Translate the `origin` query string to a concrete selector filter.
 *
 * - `actual`   → past-exam drills (IPA verbatim only)
 * - `mock`     → original practice questions (ipa_inspired + original)
 * - omitted    → no restriction
 */
function parseOrigin(value: string | undefined): OriginTypeFilter[] | undefined {
  if (value === "actual") return ["ipa_actual"];
  if (value === "mock" || value === "inspired")
    return ["ipa_inspired", "original"];
  return undefined;
}

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    count?: string;
    misconception?: string;
    topic?: string;
    year?: string;
    format?: string;
    mockExam?: string;
    origin?: string;
  }>;
}) {
  const sp = await searchParams;
  const mode = (sp.mode as
    | "weakness"
    | "topic"
    | "year"
    | "format"
    | "mixed"
    | undefined) ?? "weakness";
  const count = sp.count ? Number(sp.count) : 5;

  const res = await createSessionAction({
    mode,
    filters: {
      misconceptionSlugs: sp.misconception ? [sp.misconception] : undefined,
      topicSlugs: sp.topic ? [sp.topic] : undefined,
      examYear: sp.year ? Number(sp.year) : undefined,
      formatType: sp.format,
      originTypes: parseOrigin(sp.origin),
    },
    count,
    mockExam: sp.mockExam === "1",
  });

  // createSessionAction redirects on success — if we reach here, it returned
  // a gate/empty result. Route to pricing (paywall) or back to the hub.
  if (res && !res.ok) {
    switch (res.reason) {
      case "mock_exam_locked":
        redirect("/pricing?reason=mock_exam");
      case "mock_exam_size_locked":
        redirect("/pricing?reason=mock_exam_size");
      case "year_locked":
        redirect("/pricing?reason=year_locked");
      default:
        redirect("/learn/questions");
    }
  }
  redirect("/learn/questions");
}
