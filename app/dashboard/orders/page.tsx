import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "./orders-table";
import { FilePlus } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders / Invoices</h1>
          <p className="text-muted-foreground mt-1">View orders and create invoices</p>
        </div>
        <Link href="/dashboard/orders/create">
          <Button>
            <FilePlus className="h-4 w-4 mr-2" />
            Create invoice
          </Button>
        </Link>
      </div>
      <OrdersTable />
    </div>
  );
}
