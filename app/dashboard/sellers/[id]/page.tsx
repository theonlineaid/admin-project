import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") notFound();

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id, role: "seller" },
    include: {
      products: { take: 20, include: { category: { select: { name: true } } } },
      _count: { select: { products: true, orders: true } },
    },
  });

  if (!user) notFound();

  const totalSales = await prisma.order.aggregate({
    where: {
      status: { not: "cancelled" },
      items: { some: { product: { sellerId: id } } },
    },
    _sum: { totalPrice: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
        <p className="text-slate-600 mt-1">{user.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user._count.products}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Orders (with their products)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user._count.orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Total sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(Number(totalSales._sum.totalPrice ?? 0))}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {user.products.length === 0 ? (
            <p className="text-slate-500">No products.</p>
          ) : (
            <ul className="space-y-2">
              {user.products.map((p) => (
                <li key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <Link href={`/dashboard/products/edit/${p.id}`} className="text-emerald-600 hover:underline">
                    {p.name}
                  </Link>
                  <span className="text-sm text-slate-600">{p.category.name} · {formatCurrency(p.price.toString())}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
