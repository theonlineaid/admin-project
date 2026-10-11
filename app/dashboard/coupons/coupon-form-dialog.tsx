"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";

type Coupon = {
  id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
};

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon | null;
  onSuccess: () => void;
}) {
  const isEditing = Boolean(coupon?.id);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    discountType: coupon?.discountType ?? "percentage",
    discountValue: coupon ? Number(coupon.discountValue) : 10,
    minOrderAmount: coupon?.minOrderAmount ? Number(coupon.minOrderAmount) : "",
    maxDiscountAmount: coupon?.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : "",
    usageLimit: coupon?.usageLimit ? Number(coupon.usageLimit) : "",
    startDate: coupon?.startDate ? new Date(coupon.startDate).toISOString().slice(0, 10) : "",
    endDate: coupon?.endDate ? new Date(coupon.endDate).toISOString().slice(0, 10) : "",
    isActive: coupon?.isActive ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount !== "" ? Number(form.minOrderAmount) : null,
        maxDiscountAmount: form.maxDiscountAmount !== "" ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit !== "" ? parseInt(String(form.usageLimit), 10) : null,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        isActive: form.isActive,
      };

      const url = isEditing ? `/api/coupons/${coupon?.id}` : "/api/coupons";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to save coupon");
      } else {
        toast.success(isEditing ? "Coupon updated!" : "Coupon created successfully!");
        onSuccess();
        onOpenChange(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-md">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
      </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="coupon-code">Coupon Code</Label>
            <Input
              id="coupon-code"
              required
              placeholder="e.g. FLASH20"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="mt-1 font-mono uppercase font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="coupon-type">Discount Type</Label>
              <select
                id="coupon-type"
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="coupon-val">
                {form.discountType === "percentage" ? "Discount %" : "Discount Amount ($)"}
              </Label>
              <Input
                id="coupon-val"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="coupon-min">Min Order ($)</Label>
              <Input
                id="coupon-min"
                type="number"
                placeholder="Optional"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="coupon-max">Max Cap ($)</Label>
              <Input
                id="coupon-max"
                type="number"
                placeholder="Optional"
                value={form.maxDiscountAmount}
                onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="coupon-limit">Usage Limit</Label>
              <Input
                id="coupon-limit"
                type="number"
                placeholder="Unlimited if empty"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-medium">Coupon Active</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="end-date">Expiry Date</Label>
              <Input
                id="end-date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEditing ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
    </Dialog>
  );
}
