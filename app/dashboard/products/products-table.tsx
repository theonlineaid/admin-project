"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, Search } from "lucide-react";

export function ProductsTable() {
  const [data, setData] = useState<{
    data: Array<{
      id: string;
      name: string;
      price: { toString(): string };
      stock: number;
      status: string;
      category: { name: string };
      brand: { name: string } | null;
    }>;
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) setData((prev) => prev && { ...prev, data: prev.data.filter((p) => p.id !== id) });
  };

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.category.name}</TableCell>
                <TableCell>{row.brand?.name ?? "—"}</TableCell>
                <TableCell>{formatCurrency(row.price.toString())}</TableCell>
                <TableCell>{row.stock}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "active" ? "success" : "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/products/edit/${row.id}`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
