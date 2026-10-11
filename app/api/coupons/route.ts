import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/api-utils";
import { z } from "zod";

const createCouponSchema = z.object({
  code: z.string().min(2).max(30).transform((v) => v.toUpperCase().trim()),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  maxDiscountAmount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireAdmin(session);
    if (forbidden) return forbidden;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const q = searchParams.get("q")?.trim();

    const where: any = {};
    if (q) {
      where.code = { contains: q, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET coupons error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireAdmin(session);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = createCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({
      where: { code: parsed.data.code },
    });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        minOrderAmount: parsed.data.minOrderAmount ?? null,
        maxDiscountAmount: parsed.data.maxDiscountAmount ?? null,
        usageLimit: parsed.data.usageLimit ?? null,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : new Date(),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        isActive: parsed.data.isActive,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("POST coupon error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

