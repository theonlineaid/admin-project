import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { StorefrontCategory, StorefrontProductCard } from "@/lib/storefront";
import { ProductCard } from "@/components/storefront/product-card";
import { categoryIcon } from "@/components/storefront/home/category-icon";
import { cn } from "@/lib/utils";

export type StorefrontBrand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

export function withStock(categories: StorefrontCategory[]) {
  return categories.filter((c) => c._count.products > 0);
}

export function DarkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
    >
      {children}
    </Link>
  );
}

/** Horizontally scrolling row of product cards. */
export function ProductRail({ products }: { products: StorefrontProductCard[] }) {
  if (products.length === 0) return null;
  return (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6">
      {products.map((product) => (
        <div key={product.id} className="w-40 shrink-0 snap-start sm:w-52">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

/** Square category cards with icon and product count. */
export function CategoryTiles({ categories }: { categories: StorefrontCategory[] }) {
  const list = withStock(categories);
  if (list.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {list.map((category) => {
        const Icon = categoryIcon(category.name);
        return (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-medium text-card-foreground group-hover:text-primary">
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {category._count.products} {category._count.products === 1 ? "product" : "products"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Centered row of text chips. */
export function CategoryPills({ categories }: { categories: StorefrontCategory[] }) {
  const list = withStock(categories);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {list.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

/** Vertical category menu used beside the hero. */
export function CategorySidebar({
  categories,
  className,
}: {
  categories: StorefrontCategory[];
  className?: string;
}) {
  const list = withStock(categories);
  if (list.length === 0) return null;
  return (
    <nav aria-label="Categories" className={cn("rounded-2xl border border-border bg-card p-2", className)}>
      <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Categories
      </p>
      <ul>
        {list.map((category) => {
          const Icon = categoryIcon(category.name);
          return (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.slug}`}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-card-foreground hover:bg-muted"
              >
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                <span className="flex-1 truncate">{category.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BrandStrip({ brands }: { brands: StorefrontBrand[] }) {
  if (brands.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {brands.map((brand) => (
        <Link
          key={brand.id}
          href={`/products?brand=${brand.slug}`}
          className="flex h-14 min-w-32 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          {brand.logo ? (
            // Plain <img>: brand logos can be any URL, not only hosts allowed for next/image
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt={brand.name} className="h-7 w-auto object-contain" />
          ) : (
            brand.name
          )}
        </Link>
      ))}
    </div>
  );
}
