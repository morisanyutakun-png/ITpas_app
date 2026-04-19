"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">エラーが発生しました</h1>
      <p className="text-sm text-muted-foreground">
        DB接続やデータの取得で問題が発生した可能性があります。少し時間をおいて再度お試しください。
      </p>
      {error.digest && (
        <code className="text-xs text-muted-foreground">id: {error.digest}</code>
      )}
      <div className="flex gap-2">
        <Button onClick={reset}>再試行</Button>
        <Button variant="outline" asChild>
          <Link href="/">トップへ</Link>
        </Button>
      </div>
    </div>
  );
}
