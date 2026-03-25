"use client";

import { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataGrid, GridBadgeCell, GridLinkButtonCell } from "@/components/dashboard/data-grid";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  processing: "default",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
};

const paymentVariant: Record<string, "success" | "secondary"> = {
  completed: "success",
};

type OrderRow = {
  id: string;
  orderNumber: string;
  totalPrice: { toString(): string };
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: { name: string; email: string };
};

function OrderCustomerCell(props: CustomCellRendererProps<OrderRow>) {
  const u = props.data?.user;
  if (!u) return null;
  return (
    <div className="leading-tight py-0.5">
      <div className="text-sm">{u.name}</div>
      <div className="text-xs text-muted-foreground">{u.email}</div>
    </div>
  );
}

const orderColumnDefs: ColDef<OrderRow>[] = [
  { field: "orderNumber", headerName: "Order", maxWidth: 140, flex: 0 },
  {
    colId: "customer",
    headerName: "Customer",
    flex: 1.2,
    cellRenderer: OrderCustomerCell,
    valueGetter: (p) => `${p.data?.user.name ?? ""} ${p.data?.user.email ?? ""}`,
  },
  {
    field: "totalPrice",
    headerName: "Total",
    maxWidth: 120,
    flex: 0,
    valueFormatter: (p) => formatCurrency(p.value?.toString?.() ?? String(p.value ?? "")),
  },
  {
    field: "status",
    headerName: "Status",
    maxWidth: 130,
    flex: 0,
    cellRenderer: GridBadgeCell,
    cellRendererParams: { variantMap: statusVariant, fallback: "secondary" },
  },
  {
    field: "paymentStatus",
    headerName: "Payment",
    maxWidth: 130,
    flex: 0,
    cellRenderer: GridBadgeCell,
    cellRendererParams: { variantMap: paymentVariant, fallback: "secondary" },
  },
  {
    field: "createdAt",
    headerName: "Date",
    maxWidth: 160,
    flex: 0,
    valueFormatter: (p) => (p.value ? formatDate(String(p.value)) : ""),
  },
  {
    colId: "view",
    headerName: "",
    maxWidth: 90,
    flex: 0,
    cellRenderer: GridLinkButtonCell,
    cellRendererParams: {
      label: "View",
      getHref: (row: OrderRow) => `/dashboard/orders/${row.id}`,
    },
    filter: false,
    sortable: false,
    pinned: "right",
  },
];

export function OrdersTable() {
  const [data, setData] = useState<{
    data: OrderRow[];
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
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <DataGrid<OrderRow>
        rowData={data.data}
        columnDefs={orderColumnDefs}
        getRowId={({ data }) => data.id}
        pagination={false}
        height={440}
      />
      <DataTablePagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} total={data.total} limit={data.limit} />
    </div>
  );
}
