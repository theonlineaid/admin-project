import { ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductDetailAttributes({
  items,
}: {
  items: { id: string; label: string; value: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <section
      className="mt-8 rounded-xl border border-border bg-card shadow-sm"
      aria-labelledby="product-specs-heading"
    >
      <div className="border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
        <h2
          id="product-specs-heading"
          className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground uppercase"
        >
          <ListChecks className="size-4 text-primary" aria-hidden />
          Additional details
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground normal-case">
          Text fields and other info
        </p>
      </div>
      <dl className="divide-y divide-border">
        {items.map((row, i) => (
          <div
            key={row.id}
            className={cn(
              "grid gap-1 px-4 py-3.5 sm:grid-cols-[minmax(10rem,32%)_1fr] sm:items-baseline sm:gap-6 sm:px-5",
              i % 2 === 1 && "bg-muted/20",
            )}
          >
            <dt className="text-sm font-medium text-muted-foreground">{row.label}</dt>
            <dd className="text-sm text-foreground sm:text-[0.9375rem]">
              <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {row.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
