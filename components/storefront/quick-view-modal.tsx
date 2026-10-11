"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag, Eye, Star, Check } from "lucide-react";
import { useQuickView } from "./quick-view-context";
import { useCart } from "./cart-context";
import { formatCurrency, cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

export function QuickViewModal() {
  const { quickViewProduct, closeQuickView } = useQuickView();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImage(0);
      setQuantity(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [quickViewProduct]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && quickViewProduct) closeQuickView();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quickViewProduct, closeQuickView]);

  if (!quickViewProduct) return null;

  const price = Number(quickViewProduct.price);
  const compareAt = quickViewProduct.compareAtPrice ? Number(quickViewProduct.compareAtPrice) : null;
  const discount = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : null;
  const images = Array.isArray(quickViewProduct.images) && quickViewProduct.images.length > 0
    ? quickViewProduct.images
    : ["https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image"];

  const ratings = Array.isArray((quickViewProduct as any).reviews)
    ? (quickViewProduct as any).reviews.map((r: any) => r.rating)
    : [];
  const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : null;

  function handleAddToCart() {
    if (!quickViewProduct) return;
    addItem(
      {
        productId: quickViewProduct.id,
        name: quickViewProduct.name,
        slug: quickViewProduct.slug,
        price,
        image: images[0] ?? null,
        stock: quickViewProduct.stock,
      },
      quantity
    );
    closeQuickView();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeQuickView}
      />

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-card border border-border shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={closeQuickView}
          className="absolute right-4 top-4 z-20 rounded-full bg-background/80 p-2 text-muted-foreground hover:bg-muted hover:text-foreground backdrop-blur-xs transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Side */}
          <div className="bg-muted/30 p-6 flex flex-col justify-between">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-background border border-border/80">
              <Image
                src={images[selectedImage]}
                alt={quickViewProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-all"
              />
              {discount && (
                <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      selectedImage === idx ? "border-primary ring-2 ring-primary/20" : "border-border opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                {quickViewProduct.category && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {quickViewProduct.category.name}
                  </p>
                )}
                <h2 className="font-display mt-1 text-2xl font-bold text-foreground">
                  {quickViewProduct.name}
                </h2>
              </div>

              {/* Rating */}
              {avgRating && (
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-foreground">{avgRating}</span>
                  <span className="text-muted-foreground">({ratings.length} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-extrabold text-foreground">
                  {formatCurrency(price)}
                </span>
                {compareAt && compareAt > price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(compareAt)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs font-medium">
                {quickViewProduct.stock > 0 ? (
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-700 dark:text-emerald-400">
                      In Stock ({quickViewProduct.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-rose-600">Out of Stock</span>
                  </>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Enjoy quick shipping and reliable checkout on this item.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-11 items-center rounded-xl border border-border bg-background px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-muted disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-display font-semibold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(quickViewProduct.stock, q + 1))}
                    disabled={quantity >= quickViewProduct.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-muted disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={quickViewProduct.stock <= 0}
                  className="flex-1 font-semibold gap-2 shadow-xs"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>

              <div className="text-center">
                <Link
                  href={`/products/${quickViewProduct.slug}`}
                  onClick={closeQuickView}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View full product specifications & reviews &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

