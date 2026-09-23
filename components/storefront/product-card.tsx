import Image from "next/image";
import Link from "next/link";
import { Eye, Package } from "lucide-react";
import { formatCurrency, getDiscountPercent } from "@/lib/utils";
import type { StorefrontProductCard } from "@/lib/storefront";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

export function ProductCard({ product }: { product: StorefrontProductCard }) {
  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount = getDiscountPercent(price, compareAt);
  const image = product.images[0] ?? null;
  const outOfStock = product.stock <= 0;
  const href = `/products/${product.slug}`;

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <Package className="h-12 w-12" strokeWidth={1.25} />
            </div>
          )}
        </Link>

        {discount ? (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {discount}% OFF
          </span>
        ) : null}
        {outOfStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-2.5 py-0.5 text-[11px] font-semibold text-background">
            Out of stock
          </span>
        ) : null}

        {/* Always visible on touch screens; slides in on hover from sm up */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 transition-all duration-200 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
          <Link
            href={href}
            aria-label={`View ${product.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-card-foreground shadow-sm hover:text-primary"
          >
            <Eye className="h-4 w-4" />
          </Link>
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
            className="h-8 w-auto rounded-full px-4 shadow-sm"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {product.brand ? (
          <span className="text-xs text-muted-foreground">{product.brand.name}</span>
        ) : null}
        <Link
          href={href}
          className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{formatCurrency(price)}</span>
          {discount && compareAt ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(compareAt)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
