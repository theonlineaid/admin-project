import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrdersChart } from "@/components/charts/orders-chart";
import { formatCurrency } from "@/lib/utils";
import { getDashboardStats } from "@/lib/dashboard";
import { Package, ShoppingCart, DollarSign, Store } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  const stats = await getDashboardStats(role, userId ?? undefined, 30);

  const statCards = [
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCart },
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign },
    { title: "Total Products", value: stats.totalProducts, icon: Package },
    ...(role === "admin"
      ? [{ title: "Total Sellers", value: stats.totalSellers, icon: Store }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your store</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue (last 30 days)</CardTitle>
            <CardDescription>Daily revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats.ordersTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders (last 30 days)</CardTitle>
            <CardDescription>Daily order count</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersChart data={stats.ordersTrend} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
