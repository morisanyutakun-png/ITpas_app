import { notFound } from "next/navigation";
import { getMaterial } from "@/server/queries/materials";
import { Card, CardContent } from "@/components/ui/card";
import { Markdown } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMaterial(slug);
  if (!m) notFound();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-2">
        <Badge variant="outline">{m.type}</Badge>
        <h1 className="text-2xl font-bold">{m.title}</h1>
        {m.sourceFilePath && (
          <p className="text-xs text-muted-foreground">
            出典: {m.sourceFilePath}
            {m.sourcePageNumber ? ` (p.${m.sourcePageNumber})` : ""}
          </p>
        )}
      </header>
      <Card>
        <CardContent className="pt-6">
          <Markdown>{m.body}</Markdown>
        </CardContent>
      </Card>
    </div>
  );
}
