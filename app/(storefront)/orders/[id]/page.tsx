import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "secondary" | "success" | "destructive" | "warning"> = {
  pending: "warning",
  processing: "secondary",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const { placed } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } },
    },
  });

  if (!order || order.userId !== (session.user as { id?: string }).id) {
    notFound();
  }

  const address = order.shippingAddress as {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  } | null;

  return (
    <div className="mx-auto max-w-3xl">
      {placed ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Order placed</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ve received your order and notified the seller. You can track its status
              here.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>{order.status}</Badge>
      </div>

      <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-4">
            <Link
              href={`/products/${item.product.slug}`}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
            >
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </Link>
            <div className="flex-1">
              <Link
                href={`/products/${item.product.slug}`}
                className="text-sm font-medium text-card-foreground hover:text-primary"
              >
                {item.product.name}
              </Link>
              <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-card-foreground">
              {formatCurrency(Number(item.price) * item.quantity)}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between p-4">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(Number(order.totalPrice))}
          </span>
        </li>
      </ul>

      {address ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Shipping address</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {address.fullName} · {address.phone}
            <br />
            {address.street}, {address.city} {address.zip}
            <br />
            {address.country}
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-muted-foreground">
        Payment: cash on delivery ({order.paymentStatus})
      </p>
    </div>
  );
}
