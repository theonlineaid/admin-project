import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { formatCurrency, getDiscountPercent } from "@/lib/utils";
import type { StorefrontProductCard } from "@/lib/storefront";

export function PromoCard({ product }: { product: StorefrontProductCard }) {
  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount = getDiscountPercent(price, compareAt);
  const image = product.images[0] ?? null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full min-h-[10.5rem] items-center gap-4 rounded-2xl bg-card p-5 transition-shadow hover:shadow-md sm:p-6"
    >
      <div className="flex min-w-0 flex-1 flex-col self-stretch">
        <h3 className="line-clamp-2 font-display text-base font-semibold text-card-foreground">
          {product.name}
        </h3>
        {product.category ? (
          <p className="mt-1 text-xs text-muted-foreground">{product.category.name}</p>
        ) : null}
        <div className="mt-auto pt-4">
          {discount && compareAt ? (
            <>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Limited time offer
              </p>
              <p className="mt-0.5 flex items-baseline gap-2">
                <span className="font-display text-xl font-bold text-card-foreground">
                  {formatCurrency(price)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(compareAt)}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Save <span className="font-semibold text-emerald-600">{formatCurrency(compareAt - price)}</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Just in
              </p>
              <p className="mt-0.5 font-display text-xl font-bold text-card-foreground">
                {formatCurrency(price)}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="128px"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted text-muted-foreground/50">
            <Package className="h-10 w-10" strokeWidth={1.25} />
          </div>
        )}
      </div>
    </Link>
  );
}
