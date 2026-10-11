import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Truck, Package, Clock, ShieldCheck, Tag } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"] as const;

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

  const timeline = Array.isArray(order.timeline) ? (order.timeline as any[]) : [];
  const currentStepIndex = STATUS_STEPS.indexOf(order.status as any);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {placed ? (
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-in fade-in">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Order Successfully Placed!</p>
            <p className="text-sm text-muted-foreground">
              Thank you for your order. We have notified our fulfillment center and you can track your package below.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"} className="text-xs uppercase">
          {order.status}
        </Badge>
      </div>

      {/* Visual Tracking Progress Stepper */}
      {order.status !== "cancelled" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
            Fulfillment Status
          </h2>
          <div className="relative flex justify-between">
            {/* Connecting line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-border -z-0">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${
                    currentStepIndex <= 0
                      ? 0
                      : (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
                  }%`,
                }}
              />
            </div>

            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step} className="flex flex-col items-center z-10">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs capitalize ${
                      isCompleted ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Carrier & Tracking Card */}
      {(order.carrier || order.trackingNumber) && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Shipping Carrier: {order.carrier || "Standard Courier"}
              </p>
              <p className="text-sm font-bold text-foreground">
                Tracking Number: {order.trackingNumber || "Pending generation"}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Live Tracking
          </span>
        </div>
      )}

      {/* Order Items */}
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-4">
            <Link
              href={`/products/${item.product.slug}`}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted border border-border"
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
                className="text-sm font-medium text-foreground hover:text-primary"
              >
                {item.product.name}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quantity: <span className="font-semibold">{item.quantity}</span>
              </p>
            </div>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(Number(item.price) * item.quantity)}
            </span>
          </li>
        ))}

        {/* Breakdown */}
        {order.discountAmount && Number(order.discountAmount) > 0 ? (
          <li className="flex items-center justify-between p-4 bg-muted/20 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Tag className="h-3.5 w-3.5" />
              Coupon discount ({order.couponCode || "PROMO"})
            </span>
            <span className="font-semibold">-{formatCurrency(Number(order.discountAmount))}</span>
          </li>
        ) : null}

        <li className="flex items-center justify-between p-4 bg-muted/40">
          <span className="text-base font-bold text-foreground">Total Paid</span>
          <span className="font-display text-lg font-extrabold text-foreground">
            {formatCurrency(Number(order.totalPrice))}
          </span>
        </li>
      </ul>

      {/* Shipping Address & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {address ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Shipping address
            </h2>
            <p className="mt-3 text-sm text-foreground font-semibold">{address.fullName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              📞 {address.phone}
              <br />
              {address.street}, {address.city} {address.zip}
              <br />
              {address.country}
            </p>
          </div>
        ) : null}

        {/* Timeline Log */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Activity Log
          </h2>
          {timeline.length > 0 ? (
            <div className="space-y-3">
              {timeline.map((event: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{event.note || event.status}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Payment verified on delivery.</p>
          )}
        </div>
      </div>
    </div>
  );
}
