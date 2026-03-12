"use client";

import { useEffect, useState } from "react";
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

export function PaymentsTable() {
  const [data, setData] = useState<{
    data: Array<{
      id: string;
      amount: { toString(): string };
      method: string;
      status: string;
      createdAt: string;
      order: { orderNumber: string; user: { name: string; email: string } };
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
    fetch(`/api/payments?${params}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [page, status]);

  if (!data) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.order.orderNumber}</TableCell>
                <TableCell>
                  <div className="text-sm">{row.order.user.name}</div>
                  <div className="text-xs text-slate-500">{row.order.user.email}</div>
                </TableCell>
                <TableCell>{formatCurrency(row.amount.toString())}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "completed" ? "success" : row.status === "failed" ? "destructive" : "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
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
