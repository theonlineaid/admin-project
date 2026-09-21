import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductCard } from "@/components/storefront/product-card";

export function ProductGrid({ products }: { products: StorefrontProductCard[] }) {
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
