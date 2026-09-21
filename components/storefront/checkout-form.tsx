"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, cn } from "@/lib/utils";
import { useCart } from "@/components/storefront/cart-context";

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="font-medium text-card-foreground">Your cart is empty</p>
        <Link
          href="/products"
          className={cn(buttonVariants(), "mt-4 inline-flex")}
        >
          Browse products
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/storefront/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: {
            fullName: form.get("fullName"),
            phone: form.get("phone"),
            street: form.get("street"),
            city: form.get("city"),
            zip: form.get("zip") || undefined,
            country: form.get("country"),
          },
          notes: form.get("notes") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Couldn't place your order"
        );
        setLoading(false);
        return;
      }
      clear();
      router.push(`/orders/${data.id}?placed=1`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Shipping address</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={defaultName} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="street">Street address</Label>
              <Input id="street" name="street" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip">ZIP / postal code</Label>
              <Input id="zip" name="zip" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Delivery notes (optional)</Label>
              <Input id="notes" name="notes" />
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Placing order…" : "Place order"}
        </Button>
      </form>

      <aside className="h-fit rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-card-foreground">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Cash on delivery. You&apos;ll pay when your order arrives.
        </p>
      </aside>
    </div>
  );
}
