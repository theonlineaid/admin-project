import Link from "next/link";
import type { StorefrontCategory } from "@/lib/storefront";

export function CategoryStrip({ categories }: { categories: StorefrontCategory[] }) {
  const withStock = categories.filter((c) => c._count.products > 0);
  if (withStock.length === 0) return null;

  return (
    <nav
      aria-label="Categories"
      className="flex items-center gap-5 overflow-x-auto border-t border-border py-2.5 text-sm [scrollbar-width:none]"
    >
      {withStock.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="shrink-0 whitespace-nowrap text-muted-foreground hover:text-foreground"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}

export function CategorySection({ categories }: { categories: StorefrontCategory[] }) {
  const withStock = categories.filter((c) => c._count.products > 0);
  if (withStock.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-foreground">
        Shop by category
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {withStock.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-semibold text-primary">
              {category.name.charAt(0).toUpperCase()}
            </span>
            <span className="line-clamp-1 text-sm font-medium text-card-foreground">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
