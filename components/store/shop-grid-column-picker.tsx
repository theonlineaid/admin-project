"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Columns2, Columns3, Columns4, LayoutGrid, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [2, 3, 4, 5] as const;

/** Lucide has no Columns5; matches columns-2…4 icon style (24×24, stroke 2). */
function Columns5Icon({ className, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 shrink-0", className)}
      aria-hidden
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M6.6 3v18" />
      <path d="M10.2 3v18" />
      <path d="M13.8 3v18" />
      <path d="M17.4 3v18" />
    </svg>
  );
}

const GRID_ICONS: Record<(typeof OPTIONS)[number], React.ComponentType<LucideProps>> = {
  2: Columns2,
  3: Columns3,
  4: Columns4,
  5: Columns5Icon,
};

export function ShopGridColumnPicker({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
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
    <div className={cn("mb-4 flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <LayoutGrid className="size-4 shrink-0" aria-hidden />
        <span>Columns</span>
      </div>
      <div className="flex gap-1" role="group" aria-label="Product grid columns">
        {OPTIONS.map((n) => {
          const Icon = GRID_ICONS[n];
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={pending}
              title={`${n} columns`}
              aria-label={`${n} columns`}
              aria-pressed={selected}
              onClick={() => void setColumns(n)}
              className={cn(
                "flex size-9 items-center justify-center rounded-md border transition-colors disabled:opacity-50",
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
