"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type ProductSelectAttributeGroup = {
  attributeId: string;
  /** e.g. "size" | "color" — used for layout hints */
  attributeSlug: string;
  label: string;
  selectedOptionId: string;
  options: {
    id: string;
    label: string;
    slug: string | null;
    hex: string | null;
  }[];
};

function isHexColor(h: string | null | undefined): h is string {
  return typeof h === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(h);
}

export function ProductSelectAttributes({
  groups,
}: {
  groups: ProductSelectAttributeGroup[];
}) {
  const router = useRouter();
  if (groups.length === 0) return null;

  return (
    <div className="mt-6 space-y-6">
      {groups.map((g) => {
        const isColorish =
          g.attributeSlug.toLowerCase() === "color" ||
          g.options.some((o) => isHexColor(o.hex));
        return (
          <div key={g.attributeId}>
            <p className="mb-2 text-sm font-medium text-foreground">
              {g.label}
            </p>
            <div
              className={cn(
                "flex flex-wrap gap-2",
                isColorish && "gap-3",
              )}
              role="listbox"
              aria-label={g.label}
            >
              {g.options.map((opt) => {
                const selected = opt.id === g.selectedOptionId;
                const available = opt.slug != null;
                const showSwatch = isHexColor(opt.hex);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-disabled={!available}
                    disabled={!available}
                    title={
                      !available
                        ? `${opt.label} is not available for this product`
                        : opt.label
                    }
                    onClick={() => {
                      if (!opt.slug || selected) return;
                      router.push(`/product/${opt.slug}`);
                    }}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      selected &&
                        "cursor-default border-primary bg-primary/10 text-primary ring-2 ring-primary/25",
                      !selected &&
                        available &&
                        "border-border hover:border-primary/60 hover:bg-muted/80",
                      !available &&
                        "cursor-not-allowed border-dashed border-border bg-muted/20 text-muted-foreground opacity-60",
                    )}
                  >
                    {showSwatch && (
                      <span
                        className="size-6 shrink-0 rounded-full border border-border shadow-inner"
                        style={{ backgroundColor: opt.hex! }}
                        aria-hidden
                      />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
