"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart } from "@/components/storefront/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        <h1 className="font-display text-xl font-semibold text-foreground">
          Your cart is empty
        </h1>
        <p className="text-sm text-muted-foreground">
          Add products you love and they&apos;ll show up here.
        </p>
        <Link href="/products" className={cn(buttonVariants(), "mt-2")}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">
          Your cart
        </h1>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4">
              <Link
                href={`/products/${item.slug}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-medium text-card-foreground hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-rose-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 items-center rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-full w-8 items-center justify-center hover:bg-muted"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="flex h-full w-8 items-center justify-center hover:bg-muted disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-display text-sm font-semibold text-card-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-card-foreground">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Shipping and payment on delivery calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
        >
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
