import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusUpdate } from "./order-status-update";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) notFound();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: true } },
      payments: true,
    },
  });
  if (!order) notFound();

  const role = (session.user as { role?: string }).role;
  const userId = (session.user as { id?: string }).id;
  if (role === "customer" && order.userId !== userId) notFound();
  if (role === "seller") {
    const hasSellerProduct = order.items.some((i) => i.product.sellerId === userId);
    if (!hasSellerProduct) notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
        </div>
        {role === "admin" && <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-medium">{order.user.name}</p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{order.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <Badge variant={order.paymentStatus === "completed" ? "success" : "secondary"}>
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>Total</span>
              <span>{formatCurrency(order.totalPrice.toString())}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Price</th>
                <th className="pb-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3">{item.product.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.price.toString())}</td>
                  <td className="text-right">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {order.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {order.payments.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span>{p.method} - {p.status}</span>
                  <span>{formatCurrency(p.amount.toString())}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
