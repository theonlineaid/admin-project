"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataGrid, GridBadgeCell, GridCustomerActionsCell } from "@/components/dashboard/data-grid";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  blocked: boolean;
  createdAt: string;
  _count: { orders: number };
};

function BlockedStatusCell(props: CustomCellRendererProps<CustomerRow>) {
  if (props.data?.blocked) {
    return <Badge variant="destructive">Blocked</Badge>;
  }
  return <Badge variant="success">Active</Badge>;
}

const customerColumnDefs: ColDef<CustomerRow>[] = [
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email", flex: 1.2 },
  {
    field: "role",
    headerName: "Role",
    maxWidth: 120,
    flex: 0,
    cellRenderer: GridBadgeCell,
    cellRendererParams: { variantMap: {}, fallback: "secondary" as const },
  },
  {
    colId: "orders",
    headerName: "Orders",
    maxWidth: 100,
    flex: 0,
    valueGetter: (p) => p.data?._count.orders ?? 0,
  },
  {
    colId: "status",
    headerName: "Status",
    maxWidth: 120,
    flex: 0,
    cellRenderer: BlockedStatusCell,
    valueGetter: (p) => (p.data?.blocked ? "Blocked" : "Active"),
    filterValueGetter: (p) => (p.data?.blocked ? "Blocked" : "Active"),
  },
  {
    field: "createdAt",
    headerName: "Joined",
    maxWidth: 160,
    flex: 0,
    valueFormatter: (p) => (p.value ? formatDate(String(p.value)) : ""),
  },
  {
    colId: "actions",
    headerName: "Actions",
    maxWidth: 200,
    flex: 0,
    cellRenderer: GridCustomerActionsCell,
    filter: false,
    sortable: false,
    pinned: "right",
  },
];

export function CustomersTable() {
  const router = useRouter();
  const [data, setData] = useState<{
    data: CustomerRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    fetch(`/api/users?${params}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [page, search, role]);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        setData((prev) => (prev ? { ...prev, data: prev.data.filter((u) => u.id !== id) } : null));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete");
      }
    },
    [router]
  );

  const gridContext = useMemo(
    () => ({
      onDeleteCustomer: handleDelete,
    }),
    [handleDelete]
  );

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          className="rounded-lg border border-border px-3 py-2 text-sm"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <DataGrid<CustomerRow>
        rowData={data.data}
        columnDefs={customerColumnDefs}
        context={gridContext}
        getRowId={({ data }) => data.id}
        pagination={false}
        height={440}
      />
      <DataTablePagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} total={data.total} limit={data.limit} />
    </div>
  );
}
