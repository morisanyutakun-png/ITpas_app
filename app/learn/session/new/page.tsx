import { redirect } from "next/navigation";
import { createSessionAction } from "@/server/actions/sessions";

export const dynamic = "force-dynamic";

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

  await createSessionAction({
    mode,
    filters: {
      misconceptionSlugs: sp.misconception ? [sp.misconception] : undefined,
      topicSlugs: sp.topic ? [sp.topic] : undefined,
      examYear: sp.year ? Number(sp.year) : undefined,
      formatType: sp.format,
    },
    count,
  });
  // createSessionAction redirects on success; otherwise show fallback.
  redirect("/learn/questions");
}
