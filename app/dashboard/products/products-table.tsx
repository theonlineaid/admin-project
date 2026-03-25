"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { formatCurrency } from "@/lib/utils";
import { Search } from "lucide-react";
import { DataGrid, GridBadgeCell, GridProductActionsCell } from "@/components/dashboard/data-grid";

type ProductRow = {
  id: string;
  name: string;
  price: { toString(): string };
  stock: number;
  status: string;
  category: { name: string };
  brand: { name: string } | null;
};

const statusVariantMap = {
  active: "success" as const,
  draft: "secondary" as const,
};

function CategoryNameCell(props: CustomCellRendererProps<ProductRow>) {
  return <span>{props.data?.category.name ?? ""}</span>;
}

function BrandNameCell(props: CustomCellRendererProps<ProductRow>) {
  return <span>{props.data?.brand?.name ?? "—"}</span>;
}

const productColumnDefs: ColDef<ProductRow>[] = [
  { field: "name", headerName: "Product", flex: 1.2 },
  {
    colId: "category",
    headerName: "Category",
    cellRenderer: CategoryNameCell,
    valueGetter: (p) => p.data?.category.name ?? "",
  },
  {
    colId: "brand",
    headerName: "Brand",
    cellRenderer: BrandNameCell,
    valueGetter: (p) => p.data?.brand?.name ?? "",
  },
  {
    field: "price",
    headerName: "Price",
    maxWidth: 120,
    flex: 0,
    valueFormatter: (p) => formatCurrency(p.value?.toString?.() ?? String(p.value ?? "")),
  },
  { field: "stock", headerName: "Stock", maxWidth: 100, flex: 0 },
  {
    field: "status",
    headerName: "Status",
    maxWidth: 130,
    flex: 0,
    cellRenderer: GridBadgeCell,
    cellRendererParams: { variantMap: statusVariantMap, fallback: "secondary" },
  },
  {
    colId: "actions",
    headerName: "",
    maxWidth: 110,
    flex: 0,
    cellRenderer: GridProductActionsCell,
    filter: false,
    sortable: false,
    pinned: "right",
  },
];

export function ProductsTable() {
  const [data, setData] = useState<{
    data: ProductRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [page, search]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) setData((prev) => prev && { ...prev, data: prev.data.filter((p) => p.id !== id) });
  }, []);

  const gridContext = useMemo(
    () => ({
      onDeleteProduct: handleDelete,
    }),
    [handleDelete]
  );

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>
      <DataGrid<ProductRow>
        rowData={data.data}
        columnDefs={productColumnDefs}
        context={gridContext}
        getRowId={({ data }) => data.id}
        pagination={false}
        height={440}
      />
      <DataTablePagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} total={data.total} limit={data.limit} />
    </div>
  );
}
