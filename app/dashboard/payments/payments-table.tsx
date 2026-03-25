"use client";

import { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataGrid, GridBadgeCell } from "@/components/dashboard/data-grid";

type PaymentRow = {
  id: string;
  amount: { toString(): string };
  method: string;
  status: string;
  createdAt: string;
  order: { orderNumber: string; user: { name: string; email: string } };
};

const paymentStatusVariant: Record<string, "success" | "destructive" | "secondary"> = {
  completed: "success",
  failed: "destructive",
};

function PaymentCustomerCell(props: CustomCellRendererProps<PaymentRow>) {
  const u = props.data?.order.user;
  if (!u) return null;
  return (
    <div className="leading-tight py-0.5">
      <div className="text-sm">{u.name}</div>
      <div className="text-xs text-muted-foreground">{u.email}</div>
    </div>
  );
}

const paymentColumnDefs: ColDef<PaymentRow>[] = [
  {
    colId: "orderNumber",
    headerName: "Order",
    maxWidth: 140,
    flex: 0,
    valueGetter: (p) => p.data?.order.orderNumber ?? "",
  },
  {
    colId: "customer",
    headerName: "Customer",
    flex: 1.2,
    cellRenderer: PaymentCustomerCell,
    valueGetter: (p) => {
      const u = p.data?.order.user;
      return u ? `${u.name} ${u.email}` : "";
    },
  },
  {
    field: "amount",
    headerName: "Amount",
    maxWidth: 120,
    flex: 0,
    valueFormatter: (p) => formatCurrency(p.value?.toString?.() ?? String(p.value ?? "")),
  },
  { field: "method", headerName: "Method", maxWidth: 120, flex: 0 },
  {
    field: "status",
    headerName: "Status",
    maxWidth: 130,
    flex: 0,
    cellRenderer: GridBadgeCell,
    cellRendererParams: { variantMap: paymentStatusVariant, fallback: "secondary" },
  },
  {
    field: "createdAt",
    headerName: "Date",
    maxWidth: 160,
    flex: 0,
    valueFormatter: (p) => (p.value ? formatDate(String(p.value)) : ""),
  },
];

export function PaymentsTable() {
  const [data, setData] = useState<{
    data: PaymentRow[];
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

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          className="rounded-lg border border-border px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <DataGrid<PaymentRow>
        rowData={data.data}
        columnDefs={paymentColumnDefs}
        getRowId={({ data }) => data.id}
        pagination={false}
        height={440}
      />
      <DataTablePagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} total={data.total} limit={data.limit} />
    </div>
  );
}
