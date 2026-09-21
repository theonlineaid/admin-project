import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession, getUserId } from "@/lib/api-utils";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Your cart is empty"),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().optional(),
    country: z.string().min(1),
  }),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const productIds = [...new Set(parsed.data.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "active" },
      select: { id: true, name: true, price: true, stock: true, sellerId: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalPrice = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];
    const sellerIds = new Set<string>();

    for (const item of parsed.data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product is no longer available: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${product.name}` },
          { status: 400 }
        );
      }
      const price = Number(product.price);
      orderItems.push({ productId: product.id, quantity: item.quantity, price });
      totalPrice += price * item.quantity;
      sellerIds.add(product.sellerId);
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const ord = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalPrice,
          status: "pending",
          paymentStatus: "pending",
          notes: parsed.data.notes ?? null,
          shippingAddress: parsed.data.shippingAddress as Prisma.InputJsonValue,
        },
      });

      await tx.orderItem.createMany({
        data: orderItems.map((i) => ({
          orderId: ord.id,
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      const admins = await tx.user.findMany({
        where: { role: "admin" },
        select: { id: true },
      });
      const notifyIds = new Set([...admins.map((a) => a.id), ...sellerIds]);
      if (notifyIds.size > 0) {
        await tx.notification.createMany({
          data: [...notifyIds].map((id) => ({
            userId: id,
            type: "order",
            title: "New order",
            message: `Order #${orderNumber} was placed`,
            link: `/dashboard/orders/${ord.id}`,
          })),
        });
      }

      return tx.order.findUnique({
        where: { id: ord.id },
        include: {
          items: { include: { product: { select: { name: true, id: true, images: true } } } },
        },
      });
    });

    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
