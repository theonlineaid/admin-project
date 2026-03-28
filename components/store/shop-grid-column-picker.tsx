"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [2, 3, 4, 5] as const;

export function ShopGridColumnPicker({ value }: { value: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function setColumns(n: number) {
    if (n === value) return;
    const res = await fetch("/api/store/shop-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gridColumns: n }),
      credentials: "same-origin",
    });
    if (!res.ok) return;
    startTransition(() => router.refresh());
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-foreground">Columns</span>
      <div className="flex gap-1" role="group" aria-label="Product grid columns">
        {OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            onClick={() => void setColumns(n)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-sm transition-colors disabled:opacity-50",
              value === n
                ? "border-primary bg-primary/10 font-medium text-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
