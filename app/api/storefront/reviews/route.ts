import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getUserId } from "@/lib/api-utils";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(3).max(2000),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId, approved: true },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    const total = reviews.length;
    const avgRating = total > 0 ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)) : 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating in breakdown) {
        breakdown[r.rating as keyof typeof breakdown]++;
      }
    });

    return NextResponse.json({
      reviews,
      total,
      avgRating,
      breakdown,
    });
  } catch (error) {
    console.error("GET storefront reviews error:", error);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Please log in to leave a review" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId: parsed.data.productId,
        userId,
        rating: parsed.data.rating,
        title: parsed.data.title ?? null,
        comment: parsed.data.comment,
        approved: true, // auto-approve by default, admin can moderate
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST storefront review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

