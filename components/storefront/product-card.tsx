import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProductCard } from "@/lib/storefront";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

export function ProductCard({ product }: { product: StorefrontProductCard }) {
  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null;
  const image = product.images[0] ?? null;
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-muted"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {discount ? (
          <span className="absolute left-2 top-2 rounded-md bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">
            -{discount}%
          </span>
        ) : null}
        {outOfStock ? (
          <span className="absolute right-2 top-2 rounded-md bg-foreground/80 px-2 py-0.5 text-xs font-semibold text-background">
            Out of stock
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.brand ? (
          <span className="text-xs text-muted-foreground">{product.brand.name}</span>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-medium text-card-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-base font-semibold text-card-foreground">
            {formatCurrency(price)}
          </span>
          {compareAt && compareAt > price ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(compareAt)}
            </span>
          ) : null}
        </div>
        <div className="mt-2">
          <AddToCartButton
            product={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price,
              image,
              stock: product.stock,
            }}
            compact
          />
        </div>
      </div>
    </div>
  );
}
