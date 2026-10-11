"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, cn } from "@/lib/utils";
import { useCart } from "@/components/storefront/cart-context";
import { Tag, Check, X, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    newTotal: number;
  } | null>(null);

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

  async function handleApplyCoupon(e: FormEvent) {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setApplyingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/storefront/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon code");
        toast.error(data.error || "Invalid coupon code");
      } else {
        setAppliedCoupon(data);
        toast.success(`Coupon "${data.code}" applied: Saved ${formatCurrency(data.discountAmount)}!`);
      }
    } catch {
      setCouponError("Failed to apply coupon. Try again.");
    } finally {
      setApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError("");
    toast("Coupon removed");
  }

  const finalTotal = appliedCoupon ? appliedCoupon.newTotal : subtotal;

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
          couponCode: appliedCoupon?.code ?? undefined,
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
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Shipping address</h2>
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
              <Input id="notes" name="notes" placeholder="e.g. Leave at front door or apartment gate code" />
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto font-semibold gap-2 shadow-xs">
          <ShieldCheck className="h-4 w-4" />
          {loading ? "Placing order…" : "Place order (Cash on Delivery)"}
        </Button>
      </form>

      <aside className="h-fit space-y-4">
        {/* Coupon Form */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-primary" />
            Discount Coupon
          </h2>
          {appliedCoupon ? (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {appliedCoupon.code}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  (-{formatCurrency(appliedCoupon.discountAmount)})
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove coupon"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
              <Input
                placeholder="e.g. WELCOME15"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                className="text-xs uppercase"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={applyingCoupon || !couponCodeInput.trim()}
                className="text-xs shrink-0"
              >
                {applyingCoupon ? "…" : "Apply"}
              </Button>
            </form>
          )}

          {couponError && (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{couponError}</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
          <ul className="mt-4 space-y-3 max-h-60 overflow-y-auto divide-y divide-border/60">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between pt-2 first:pt-0 text-sm">
                <span className="text-muted-foreground truncate max-w-[180px]">
                  {item.name} <span className="text-xs font-semibold">×{item.quantity}</span>
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount ({appliedCoupon.code})</span>
                <span className="font-semibold">-{formatCurrency(appliedCoupon.discountAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-foreground">
              <span>Total</span>
              <span className="font-display text-lg text-primary">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-muted/50 p-2.5 text-center text-xs text-muted-foreground">
            💵 Cash on delivery: Pay securely when your package arrives at your door.
          </p>
        </div>
      </aside>
    </div>
  );
}
