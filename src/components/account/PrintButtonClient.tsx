"use client";

import { Printer } from "lucide-react";

export function PrintButtonClient() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow hover:bg-slate-800"
    >
      <Printer className="h-4 w-4" />
      PDFとして保存
    </button>
  );
}
