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
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

export function SellersTable() {
  const [data, setData] = useState<{
    data: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      _count: { orders: number };
    }>;
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
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row._count.orders}</TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
                <TableCell>
                  <Link href={`/dashboard/sellers/${row.id}`}>
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
