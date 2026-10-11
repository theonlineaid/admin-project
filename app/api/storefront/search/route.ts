import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], categories: [] });
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: "active",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 6,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          images: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.category.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        take: 3,
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: { where: { status: "active" } } } },
        },
      }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        image: p.images[0] ?? null,
        categoryName: p.category.name,
      })),
      categories,
    });
  } catch (error) {
    console.error("Storefront search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

