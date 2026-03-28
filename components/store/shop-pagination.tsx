"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Up to five consecutive page numbers, plus first/last with ellipses when needed (stable “1 2 3 4 5” style). */
function paginationItems(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const windowSize = 5;

  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let winStart = Math.max(1, current - Math.floor(windowSize / 2));
  let winEnd = winStart + windowSize - 1;
  if (winEnd > total) {
    winEnd = total;
    winStart = total - windowSize + 1;
  }

  const out: (number | "ellipsis")[] = [];

  if (winStart > 1) {
    out.push(1);
    if (winStart > 2) out.push("ellipsis");
  }

  for (let p = winStart; p <= winEnd; p++) {
    out.push(p);
  }

  if (winEnd < total) {
    if (winEnd < total - 1) out.push("ellipsis");
    out.push(total);
  }

  return out;
}

async function patchListPage(page: number) {
  const res = await fetch("/api/store/shop-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listPage: page }),
    credentials: "same-origin",
  });
  return res.ok;
}

export function ShopPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const items = paginationItems(page, totalPages);
  const navBtn = (extra?: string) =>
    cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1", extra);

  async function go(p: number) {
    if (p === page || p < 1 || p > totalPages || pending) return;
    const ok = await patchListPage(p);
    if (!ok) return;
    startTransition(() => router.refresh());
  }

  return (
    <nav
      className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
      aria-label="Pagination"
    >
      <div className="flex flex-wrap items-center justify-center gap-1">
        {page > 1 ? (
          <>
            <button
              type="button"
              disabled={pending}
              className={navBtn("px-2")}
              aria-label="First page"
              onClick={() => void go(1)}
            >
              <ChevronsLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              disabled={pending}
              className={navBtn("px-2")}
              aria-label="Previous page"
              onClick={() => void go(page - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
          </>
        ) : (
          <>
            <span
              className={cn(navBtn("pointer-events-none opacity-40"), "px-2")}
              aria-hidden
            >
              <ChevronsLeft className="size-4" />
            </span>
            <span
              className={cn(navBtn("pointer-events-none opacity-40"), "px-2")}
              aria-hidden
            >
              <ChevronLeft className="size-4" />
            </span>
          </>
        )}

        {items.map((item, i) =>
          item === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="px-2 text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={pending}
              className={cn(
                navBtn("min-w-9 px-0"),
                item === page &&
                  "border-primary bg-primary/10 font-medium text-foreground",
              )}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => void go(item)}
            >
              {item}
            </button>
          ),
        )}

        {page < totalPages ? (
          <>
            <button
              type="button"
              disabled={pending}
              className={navBtn("px-2")}
              aria-label="Next page"
              onClick={() => void go(page + 1)}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              disabled={pending}
              className={navBtn("px-2")}
              aria-label="Last page"
              onClick={() => void go(totalPages)}
            >
              <ChevronsRight className="size-4" aria-hidden />
            </button>
          </>
        ) : (
          <>
            <span
              className={cn(navBtn("pointer-events-none opacity-40"), "px-2")}
              aria-hidden
            >
              <ChevronRight className="size-4" />
            </span>
            <span
              className={cn(navBtn("pointer-events-none opacity-40"), "px-2")}
              aria-hidden
            >
              <ChevronsRight className="size-4" />
            </span>
          </>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
    </nav>
  );
}
