import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getUserId } from "@/lib/api-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const role = (session.user as { role?: string }).role;
    const userId = getUserId(session);
    if (role === "customer" && order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (role === "seller") {
      const hasSellerProduct = order.items.some(
        (i) => i.product.sellerId === userId
      );
      if (!hasSellerProduct) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
