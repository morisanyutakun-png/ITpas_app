import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 space-y-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-muted-foreground">
        お探しのページは見つかりませんでした。
      </p>
      <Button asChild>
        <Link href="/">トップへ戻る</Link>
      </Button>
    </div>
  );
}
