import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin, getUserId } from "@/lib/api-utils";
import { subDays } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    const userId = getUserId(session);
    const { searchParams } = new URL(req.url);
    const days = Math.min(90, Math.max(7, parseInt(searchParams.get("days") ?? "30", 10)));

    const whereOrder: Record<string, unknown> = {};
    if (role === "seller") {
      whereOrder.items = { some: { product: { sellerId: userId } } };
    }

    const [totalOrders, revenueResult, totalProducts, totalSellers, ordersByDay] =
      await Promise.all([
        prisma.order.count({
          where: { ...whereOrder, status: { not: "cancelled" } },
        }),
        prisma.order.aggregate({
          where: {
            ...whereOrder,
            status: { not: "cancelled" },
            paymentStatus: "completed",
          },
          _sum: { totalPrice: true },
        }),
        role === "admin"
          ? prisma.product.count()
          : prisma.product.count({ where: { sellerId: userId! } }),
        role === "admin" ? prisma.user.count({ where: { role: "seller" } }) : 0,
        prisma.order.groupBy({
          by: ["createdAt"],
          where: {
            ...whereOrder,
            createdAt: { gte: subDays(new Date(), days) },
            status: { not: "cancelled" },
          },
          _sum: { totalPrice: true },
          _count: true,
        }),
      ]);

    const totalRevenue = Number(revenueResult._sum.totalPrice ?? 0);

    const dateMap = new Map<string, { count: number; revenue: number }>();
    const start = subDays(new Date(), days);
    for (let d = new Date(start); d <= new Date(); d.setDate(d.getDate() + 1)) {
      dateMap.set(d.toISOString().slice(0, 10), { count: 0, revenue: 0 });
    }
    for (const row of ordersByDay) {
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      const current = dateMap.get(key) ?? { count: 0, revenue: 0 };
      dateMap.set(key, {
        count: current.count + row._count,
        revenue: current.revenue + Number(row._sum.totalPrice ?? 0),
      });
    }

    const ordersTrend = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date, count: v.count, revenue: v.revenue }));

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalSellers,
      ordersTrend,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
