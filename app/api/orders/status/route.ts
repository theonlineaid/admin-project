import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/api-utils";
import { z } from "zod";

const bodySchema = z.object({
  orderId: z.string(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireAdmin(session);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: parsed.data.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled" },
    });

    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
