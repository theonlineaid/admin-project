"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/components/storefront/wishlist-context";
import { ProductCard } from "@/components/storefront/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StorefrontProductCard } from "@/lib/storefront";

export default function WishlistPage() {
  const { wishlistIds, loading: contextLoading } = useWishlist();
  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/storefront/products?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          const wished = data.data.filter((p: any) => wishlistIds.includes(p.id));
          setProducts(wished);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  if (contextLoading || loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your wishlist…</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="rounded-full bg-rose-50 dark:bg-rose-950/30 p-5">
          <Heart className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Your Wishlist is Empty
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Explore our store and click the heart icon on any product you love to save it for later.
        </p>
        <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "mt-4 gap-2 font-semibold")}>
          <ShoppingBag className="h-4 w-4" />
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Wishlist ({products.length})
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Items you have saved to purchase later or keep an eye on.
          </p>
        </div>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          Continue Shopping
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

