import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireSellerOrAdmin, getUserId } from "@/lib/api-utils";
import {
  expandProductAttributeInput,
  productAttributeInputSchema,
} from "@/lib/product-attribute-input";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.string().optional(),
  sellerId: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sellerId: searchParams.get("sellerId") ?? undefined,
    });
    const { page, limit, search, categoryId, status, sellerId } = parsed.success
      ? parsed.data
      : { page: 1, limit: 10, search: undefined, categoryId: undefined, status: undefined, sellerId: undefined };

    const userId = getUserId(session)!;
    const role = (session!.user as { role?: string }).role;
    const where: Record<string, unknown> = {};
    if (role === "seller") where.sellerId = userId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (sellerId && role === "admin") where.sellerId = sellerId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.string().default("draft"),
  images: z.array(z.string()).default([]),
  productAttributes: z.array(productAttributeInputSchema).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const userId = getUserId(session)!;
    const slug =
      parsed.data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "") +
      "-" +
      Date.now();

    const { productAttributes: paInput, ...productData } = parsed.data;
    const expandedAttrs =
      paInput?.length && paInput.length > 0
        ? await expandProductAttributeInput(prisma, paInput)
        : [];
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        sellerId: userId,
        productAttributes:
          expandedAttrs.length > 0
            ? {
                create: expandedAttrs.map((pa) => ({
                  attributeId: pa.attributeId,
                  attributeOptionId: pa.attributeOptionId,
                  valueText: pa.valueText,
                })),
              }
            : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        productAttributes: {
          include: {
            attribute: true,
            attributeOption: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
