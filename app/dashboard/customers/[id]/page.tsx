import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { BlockUserButton } from "./block-user-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const forbidden = (session?.user as { role?: string })?.role !== "admin";
  if (forbidden) notFound();

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      blocked: true,
      createdAt: true,
      orders: {
        include: { items: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { orders: true } },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-slate-600 mt-1">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={user.blocked ? "destructive" : "success"}>
            {user.blocked ? "Blocked" : "Active"}
          </Badge>
          <BlockUserButton userId={user.id} blocked={user.blocked} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="text-slate-600">Role</span> <Badge variant="secondary">{user.role}</Badge></p>
          <p><span className="text-slate-600">Total orders</span> {user._count.orders}</p>
          <p><span className="text-slate-600">Member since</span> {formatDate(user.createdAt)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {user.orders.length === 0 ? (
            <p className="text-slate-500">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {user.orders.map((order) => (
                <li key={order.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <Link href={`/dashboard/orders/${order.id}`} className="text-emerald-600 hover:underline">
                    {order.orderNumber} – {formatCurrency(order.totalPrice.toString())}
                  </Link>
                  <Badge variant="secondary">{order.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
