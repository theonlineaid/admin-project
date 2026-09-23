import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductCard } from "@/components/storefront/product-card";

const COLUMNS = {
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
} as const;

export function ProductGrid({
  products,
  columns = 4,
}: {
  products: StorefrontProductCard[];
  columns?: keyof typeof COLUMNS;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="font-medium text-card-foreground">No products found</p>
        <p className="text-sm text-muted-foreground">
          Try a different search or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-x-4 gap-y-8 ${COLUMNS[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
