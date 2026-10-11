"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

export function AnnouncementBar({
  text,
  enabled,
}: {
  text?: string | null;
  enabled?: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || !text || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary/95 via-primary to-primary/90 text-primary-foreground py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 shadow-xs transition-all">
      <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-amber-300" />
      <span className="truncate">{text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

