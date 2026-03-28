import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireSellerOrAdmin, getUserId } from "@/lib/api-utils";
import { z } from "zod";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        seller: { select: { id: true, name: true, email: true } },
        productAttributes: {
          include: { attribute: true, attributeOption: true },
        },
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const userId = getUserId(session)!;
    const role = (session!.user as { role?: string }).role;
    if (role === "seller" && product.sellerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

const productAttributeSchema = z.object({
  attributeId: z.string(),
  attributeOptionId: z.string().optional().nullable(),
  valueText: z.string().optional().nullable(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  status: z.string().optional(),
  images: z.array(z.string()).optional(),
  productAttributes: z.array(productAttributeSchema).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const userId = getUserId(session)!;
    const role = (session!.user as { role?: string }).role;
    if (role === "seller" && product.sellerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productAttributes: paInput, ...updateData } = parsed.data;
    if (paInput !== undefined) {
      await prisma.productAttribute.deleteMany({ where: { productId: id } });
      if (paInput.length > 0) {
        await prisma.productAttribute.createMany({
          data: paInput.map((pa) => ({
            productId: id,
            attributeId: pa.attributeId,
            attributeOptionId:
              pa.attributeOptionId != null && pa.attributeOptionId !== ""
                ? pa.attributeOptionId
                : null,
            valueText:
              pa.valueText != null && String(pa.valueText).trim() !== ""
                ? String(pa.valueText).trim()
                : null,
          })),
        });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        productAttributes: {
          include: { attribute: true, attributeOption: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const userId = getUserId(session)!;
    const role = (session!.user as { role?: string }).role;
    if (role === "seller" && product.sellerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
