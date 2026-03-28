"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SHOP_PAGE_SIZE_OPTIONS } from "@/lib/shop-url";
import { cn } from "@/lib/utils";

export function ShopPageSizeSelect({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const v = String(value);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="shop-page-size" className="text-sm font-medium text-muted-foreground">
        Per page
      </label>
      <select
        id="shop-page-size"
        aria-label="Products per page"
        disabled={pending}
        className={cn(
          "rounded-md border border-border bg-background px-2 py-2 text-sm disabled:opacity-50",
          className ?? "min-w-[4.5rem]",
        )}
        value={v}
        onChange={(e) => {
          const next = Number.parseInt(e.target.value, 10);
          void (async () => {
            const res = await fetch("/api/store/shop-settings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pageSize: next }),
              credentials: "same-origin",
            });
            if (!res.ok) return;
            startTransition(() => router.refresh());
          })();
        }}
      >
        {SHOP_PAGE_SIZE_OPTIONS.map((n) => (
          <option key={n} value={String(n)}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
