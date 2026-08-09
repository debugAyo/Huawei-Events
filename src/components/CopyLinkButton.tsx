"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — ignore.
    }
  }

  return (
    <button
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition",
        copied
          ? "border-green-400/50 bg-green-400/10 text-green-300"
          : "border-white/10 bg-slate-900 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300",
      )}
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied ? "Copied!" : "Copy share link"}
    </button>
  );
}
