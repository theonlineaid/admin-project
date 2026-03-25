"use client";

import { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import { DataGrid, GridLinkButtonCell } from "@/components/dashboard/data-grid";

type SellerRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { orders: number };
};

const sellerColumnDefs: ColDef<SellerRow>[] = [
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email", flex: 1.2 },
  {
    colId: "orders",
    headerName: "Orders",
    maxWidth: 100,
    flex: 0,
    valueGetter: (p) => p.data?._count.orders ?? 0,
  },
  {
    field: "createdAt",
    headerName: "Joined",
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
      getHref: (row: SellerRow) => `/dashboard/sellers/${row.id}`,
    },
    filter: false,
    sortable: false,
    pinned: "right",
  },
];

export function SellersTable() {
  const [data, setData] = useState<{
    data: SellerRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10", role: "seller" });
    if (search) params.set("search", search);
    fetch(`/api/users?${params}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [page, search]);

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sellers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>
      <DataGrid<SellerRow>
        rowData={data.data}
        columnDefs={sellerColumnDefs}
        getRowId={({ data }) => data.id}
        pagination={false}
        height={440}
      />
      <DataTablePagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} total={data.total} limit={data.limit} />
    </div>
  );
}
