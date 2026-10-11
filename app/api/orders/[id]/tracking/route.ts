import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireSellerOrAdmin } from "@/lib/api-utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const trackingSchema = z.object({
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  note: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const { id } = await params;
    const body = await req.json();
    const parsed = trackingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentTimeline = Array.isArray(order.timeline) ? (order.timeline as any[]) : [];
    const newTimeline = [...currentTimeline];

    if (parsed.data.status && parsed.data.status !== order.status) {
      newTimeline.push({
        status: parsed.data.status,
        timestamp: new Date().toISOString(),
        note: parsed.data.note || `Order marked as ${parsed.data.status}`,
      });
    } else if (parsed.data.note) {
      newTimeline.push({
        status: order.status,
        timestamp: new Date().toISOString(),
        note: parsed.data.note,
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(parsed.data.carrier !== undefined && { carrier: parsed.data.carrier }),
        ...(parsed.data.trackingNumber !== undefined && { trackingNumber: parsed.data.trackingNumber }),
        ...(parsed.data.status && { status: parsed.data.status }),
        timeline: newTimeline as Prisma.InputJsonValue,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "order_update",
        title: `Order Update #${order.orderNumber}`,
        message: `Your order status is now ${updated.status}. ${parsed.data.trackingNumber ? `Tracking: ${parsed.data.trackingNumber}` : ""}`.trim(),
        link: `/orders/${order.id}`,
      },
    }).catch(console.error);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Order tracking update error:", error);
    return NextResponse.json({ error: "Failed to update tracking" }, { status: 500 });
  }
}

