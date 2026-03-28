import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusUpdate } from "./order-status-update";
import { DownloadInvoicePdf } from "./download-invoice-pdf";

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

  const shipping = order.shippingAddress as Record<string, string> | null;

  const orderForPdf = {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    totalPrice: order.totalPrice.toString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    notes: order.notes,
    user: { name: order.user.name, email: order.user.email },
    shippingAddress: shipping,
    items: order.items.map((i) => ({
      product: { name: i.product.name },
      quantity: i.quantity,
      price: i.price.toString(),
      variantSummary: i.variantSummary,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Invoice header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">INVOICE</h1>
          <p className="text-muted-foreground mt-1">#{order.orderNumber}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DownloadInvoicePdf order={orderForPdf} />
          <Badge variant={order.status === "delivered" ? "success" : order.status === "cancelled" ? "destructive" : "secondary"}>
            {order.status}
          </Badge>
          <Badge variant={order.paymentStatus === "completed" ? "success" : "secondary"}>
            {order.paymentStatus}
          </Badge>
          {role === "admin" && <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />}
        </div>
      </div>

      {/* Bill to & date */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Bill to
          </h2>
          <p className="font-medium text-foreground">{order.user.name}</p>
          <p className="text-sm text-muted-foreground">{order.user.email}</p>
          {shipping && (shipping.street || shipping.city) && (
            <div className="mt-2 text-sm text-muted-foreground">
              {[shipping.street, shipping.city, shipping.zip, shipping.country]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Invoice date</span> {formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Line items table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left font-medium text-foreground p-4">Product</th>
              <th className="text-right font-medium text-foreground p-4 w-20">Qty</th>
              <th className="text-right font-medium text-foreground p-4 w-28">Unit price</th>
              <th className="text-right font-medium text-foreground p-4 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="p-4 text-foreground">
                  <div className="font-medium">{item.product.name}</div>
                  {item.variantSummary ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.variantSummary}
                    </div>
                  ) : null}
                </td>
                <td className="p-4 text-right text-foreground">{item.quantity}</td>
                <td className="p-4 text-right text-foreground">{formatCurrency(item.price.toString())}</td>
                <td className="p-4 text-right text-foreground font-medium">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-muted/50 px-4 py-3 flex justify-end">
          <div className="flex items-center gap-8">
            <span className="text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">{formatCurrency(order.totalPrice.toString())}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h2>
          <p className="text-sm text-foreground">{order.notes}</p>
        </div>
      )}

      {order.payments.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payments</h2>
          <ul className="space-y-2 text-sm">
            {order.payments.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span className="text-muted-foreground">{p.method} – {p.status}</span>
                <span className="text-foreground font-medium">{formatCurrency(p.amount.toString())}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
