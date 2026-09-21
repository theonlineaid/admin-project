import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

const STATUS_VARIANT: Record<string, "secondary" | "success" | "destructive" | "warning"> = {
  pending: "warning",
  processing: "secondary",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as { id?: string }).id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-foreground">My orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Package className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium text-card-foreground">No orders yet</p>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-muted"
              >
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-card-foreground">
                    {formatCurrency(Number(order.totalPrice))}
                  </span>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>
                    {order.status}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
