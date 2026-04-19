import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-sm leading-6 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2",
        "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2",
        "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1",
        "[&_p]:my-2 [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal",
        "[&_table]:my-3 [&_table]:border-collapse [&_table]:w-full",
        "[&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:text-left",
        "[&_td]:border [&_td]:px-2 [&_td]:py-1",
        "[&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-xs",
        "[&_strong]:font-semibold",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
