"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Package, Star } from "lucide-react";
import { formatCurrency, getDiscountPercent, cn } from "@/lib/utils";
import type { StorefrontProductCard } from "@/lib/storefront";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { useWishlist } from "@/components/storefront/wishlist-context";
import { useQuickView } from "@/components/storefront/quick-view-context";

export function ProductCard({ product }: { product: StorefrontProductCard }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useQuickView();

  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount = getDiscountPercent(price, compareAt);
  const image = product.images[0] ?? null;
  const outOfStock = product.stock <= 0;
  const href = `/products/${product.slug}`;
  const isWished = isInWishlist(product.id);

  const ratings = Array.isArray((product as any).reviews)
    ? (product as any).reviews.map((r: any) => r.rating)
    : [];
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <div className="group flex flex-col relative">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/60 border border-border/60 transition-all hover:shadow-md">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <Package className="h-12 w-12" strokeWidth={1.25} />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {(product as any).badge ? (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
              {(product as any).badge}
            </span>
          ) : discount ? (
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              -{discount}%
            </span>
          ) : null}
          {outOfStock ? (
            <span className="rounded-full bg-neutral-900/80 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
              Sold out
            </span>
          ) : null}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product.name)}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 backdrop-blur-xs shadow-xs transition-transform duration-200 hover:scale-110",
            isWished ? "text-rose-600 fill-rose-600" : "text-muted-foreground hover:text-rose-600"
          )}
        >
          <Heart className={cn("h-4 w-4", isWished ? "fill-rose-600" : "")} />
        </button>

        {/* Quick actions hover overlay */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-center gap-2 transition-all duration-200 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => openQuickView(product)}
            aria-label={`Quick view ${product.name}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-card-foreground shadow-md transition-all hover:bg-muted hover:text-primary"
            title="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
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
            className="h-9 w-auto rounded-full px-4 shadow-md font-medium text-xs"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {product.brand ? (
            <span>{product.brand.name}</span>
          ) : product.category ? (
            <span>{product.category.name}</span>
          ) : <span />}

          {avgRating && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{avgRating}</span>
            </div>
          )}
        </div>

        <Link
          href={href}
          className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">{formatCurrency(price)}</span>
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
