import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getUserId } from "@/lib/api-utils";
import { formatOrderItemVariantSummary } from "@/lib/storefront-product-attributes";
import { z } from "zod";

const createOrderSchema = z.object({
  userId: z.string().min(1, "Customer is required"),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1, "At least one item is required"),
  notes: z.string().optional(),
  shippingAddress: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    const currentUserId = getUserId(session);
    if (role !== "admin" && role !== "seller") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const customer = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
    });
    if (!customer || customer.blocked) {
      return NextResponse.json(
        { error: "Customer not found or blocked" },
        { status: 400 }
      );
    }

    const productIds = [...new Set(parsed.data.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "active" },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        sellerId: true,
        productAttributes: {
          orderBy: { attribute: { sortOrder: "asc" } },
          include: {
            attribute: {
              select: { name: true, type: true },
            },
            attributeOption: {
              select: { value: true },
            },
          },
        },
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    if (role === "seller") {
      const allSellerProducts = products.every((p) => p.sellerId === currentUserId);
      if (!allSellerProducts) {
        return NextResponse.json(
          { error: "You can only add your own products to an invoice" },
          { status: 403 }
        );
      }
    }

    const orderNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let totalPrice = 0;
    const orderItems: {
      productId: string;
      quantity: number;
      price: number;
      variantSummary: string | null;
    }[] = [];

    for (const item of parsed.data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      const price = Number(product.price);
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        variantSummary: formatOrderItemVariantSummary(product),
      });
      totalPrice += price * item.quantity;
    }

    const order = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({
        data: {
          orderNumber,
          userId: parsed.data.userId,
          totalPrice,
          status: "pending",
          paymentStatus: "pending",
          notes: parsed.data.notes ?? null,
          shippingAddress: parsed.data.shippingAddress as Prisma.InputJsonValue | undefined,
        },
      });
      await tx.orderItem.createMany({
        data: orderItems.map((i) => ({
          orderId: ord.id,
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          variantSummary: i.variantSummary,
        })),
      });
      const admins = await tx.user.findMany({
        where: { role: "admin" },
        select: { id: true },
      });
      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: "order",
            title: "New order",
            message: `Order #${orderNumber} created`,
            link: `/dashboard/orders/${ord.id}`,
          })),
        });
      }
      return tx.order.findUnique({
        where: { id: ord.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { name: true, id: true } } } },
        },
      });
    });

    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    const userId = getUserId(session);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const status = searchParams.get("status") ?? undefined;

    const where: Record<string, unknown> = {};
    if (role === "seller") {
      where.items = { some: { product: { sellerId: userId } } };
    } else if (role === "customer") {
      where.userId = userId;
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { name: true, id: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
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
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
