"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  processing: "default",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
};

export function OrdersTable() {
  const [data, setData] = useState<{
    data: Array<{
      id: string;
      orderNumber: string;
      totalPrice: { toString(): string };
      status: string;
      paymentStatus: string;
      createdAt: string;
      user: { name: string; email: string };
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (status) params.set("status", status);
    fetch(`/api/orders?${params}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [page, status]);

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          className="rounded-lg border border-border px-3 py-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.orderNumber}</TableCell>
                <TableCell>
                  <div className="text-sm">{row.user.name}</div>
                  <div className="text-xs text-muted-foreground">{row.user.email}</div>
                </TableCell>
                <TableCell>{formatCurrency(row.totalPrice.toString())}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[row.status] ?? "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={row.paymentStatus === "completed" ? "success" : "secondary"}>
                    {row.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
                <TableCell>
                  <Link href={`/dashboard/orders/${row.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTablePagination
          page={data.page}
          totalPages={data.totalPages}
          onPageChange={setPage}
          total={data.total}
          limit={data.limit}
        />
      </div>
    </div>
  );
}
