import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public API: get one active product by slug. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findFirst({
      where: { slug, status: "active" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
        productAttributes: {
          orderBy: { attribute: { sortOrder: "asc" } },
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
                nameTranslations: true,
                type: true,
                slug: true,
                sortOrder: true,
                options: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    id: true,
                    value: true,
                    valueTranslations: true,
                    sortOrder: true,
                  },
                },
              },
            },
            attributeOption: {
              select: {
                id: true,
                value: true,
                valueTranslations: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
