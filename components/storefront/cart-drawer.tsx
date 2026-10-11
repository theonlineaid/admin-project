"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCart } from "./cart-context";
import { formatCurrency, cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, subtotal, count } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isCartOpen) closeCart();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const freeShippingGoal = 100;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingGoal) * 100);
  const remainingForFree = Math.max(0, freeShippingGoal - subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform animate-in slide-in-from-right duration-300 border-l border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Your Cart ({count})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="border-b border-border/80 bg-muted/40 px-5 py-3">
          <div className="flex items-center justify-between text-xs font-medium text-foreground">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary" />
              {remainingForFree === 0
                ? "🎉 You qualified for FREE shipping!"
                : `Add ${formatCurrency(remainingForFree)} more for Free Shipping`}
            </span>
            <span className="text-muted-foreground">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Your cart is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Looks like you haven&apos;t added any items yet.
              </p>
              <button
                onClick={closeCart}
                className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4 py-4">
                <Link
                  href={`/products/${item.slug}`}
                  onClick={closeCart}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted border border-border"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-foreground hover:text-primary line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-rose-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex h-8 items-center rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-full w-7 items-center justify-center hover:bg-muted"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="flex h-full w-7 items-center justify-center hover:bg-muted disabled:opacity-40"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-display text-sm font-bold text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="font-display font-bold text-foreground text-lg">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Taxes and shipping calculated at checkout.
            </p>
            <div className="space-y-2 pt-1">
              <Link
                href="/checkout"
                onClick={closeCart}
                className={cn(buttonVariants({ size: "lg" }), "w-full font-semibold shadow-xs flex items-center justify-center gap-2")}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full text-xs")}
              >
                View & Edit Shopping Bag
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

