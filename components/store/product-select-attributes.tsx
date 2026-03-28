"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type ProductSelectAttributeGroup = {
  attributeId: string;
  label: string;
  selectedOptionId: string;
  options: { id: string; label: string; slug: string | null }[];
};

export function ProductSelectAttributes({
  groups,
}: {
  groups: ProductSelectAttributeGroup[];
}) {
  const router = useRouter();
  if (groups.length === 0) return null;

  return (
    <div className="mt-6 space-y-5">
      {groups.map((g) => (
        <div key={g.attributeId}>
          <p className="mb-2 text-sm font-medium text-foreground">
            Choose {g.label}
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="listbox"
            aria-label={`Choose ${g.label}`}
          >
            {g.options.map((opt) => {
              const selected = opt.id === g.selectedOptionId;
              const available = opt.slug != null;
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
                      ? `This ${g.label.toLowerCase()} is not available for this product`
                      : undefined
                  }
                  onClick={() => {
                    if (!opt.slug || selected) return;
                    router.push(`/product/${opt.slug}`);
                  }}
                  className={cn(
                    "min-h-10 min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    selected &&
                      "cursor-default border-primary bg-primary/10 text-primary ring-2 ring-primary/25",
                    !selected &&
                      available &&
                      "border-border hover:border-primary/60 hover:bg-muted/80",
                    !available &&
                      "cursor-not-allowed border-dashed border-border bg-muted/20 text-muted-foreground opacity-60",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
