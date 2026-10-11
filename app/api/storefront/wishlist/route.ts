import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getUserId } from "@/lib/api-utils";
import { z } from "zod";

const toggleWishlistSchema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  try {
    const session = await getSession();
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            stock: true,
            images: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({
      items: items.map((i) => i.product),
      productIds: items.map((i) => i.productId),
    });
  } catch (error) {
    console.error("GET wishlist error:", error);
    return NextResponse.json({ error: "Failed to load wishlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Please log in to manage your wishlist" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = toggleWishlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const { productId } = parsed.data;

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ inWishlist: false, productId });
    } else {
      await prisma.wishlistItem.create({
        data: { userId, productId },
      });
      return NextResponse.json({ inWishlist: true, productId });
    }
  } catch (error) {
    console.error("POST wishlist error:", error);
    return NextResponse.json({ error: "Failed to toggle wishlist" }, { status: 500 });
  }
}

