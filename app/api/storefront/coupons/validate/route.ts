import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const validateCouponSchema = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase().trim()),
  subtotal: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid coupon format or subtotal" }, { status: 400 });
    }

    const { code, subtotal } = parsed.data;

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return NextResponse.json({ error: "This coupon is not active yet" }, { status: 400 });
    }
    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit has been reached" }, { status: 400 });
    }

    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (subtotal < minAmount) {
      return NextResponse.json(
        { error: `Minimum order of $${minAmount.toFixed(2)} required for this coupon` },
        { status: 400 }
      );
    }

    let discount = 0;
    const value = Number(coupon.discountValue);
    if (coupon.discountType === "percentage") {
      discount = (subtotal * value) / 100;
      if (coupon.maxDiscountAmount) {
        const maxDisc = Number(coupon.maxDiscountAmount);
        if (discount > maxDisc) discount = maxDisc;
      }
    } else {
      discount = Math.min(value, subtotal);
    }

    const finalTotal = Math.max(0, subtotal - discount);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: value,
      discountAmount: Number(discount.toFixed(2)),
      newTotal: Number(finalTotal.toFixed(2)),
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}

