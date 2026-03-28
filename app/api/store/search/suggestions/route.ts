import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { buildStorefrontProductWhere } from "@/lib/storefront-products";

const querySchema = z.object({
  q: z.string().min(1).max(120),
  categoryId: z.string().optional(),
});

/** Public: lightweight product suggestions for header autocomplete (name / SKU / description). */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      q: searchParams.get("q") ?? "",
      categoryId: searchParams.get("categoryId") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ suggestions: [] });
    }
    const { q, categoryId } = parsed.data;
    const term = q.trim();
    const where = await buildStorefrontProductWhere({
      search: term,
      categoryId,
    });

    const products = await prisma.product.findMany({
      where,
      take: 8,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        category: { select: { name: true } },
      },
    });

    return NextResponse.json({
      suggestions: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.images?.[0] ?? null,
        price: p.price.toString(),
        categoryName: p.category.name,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
