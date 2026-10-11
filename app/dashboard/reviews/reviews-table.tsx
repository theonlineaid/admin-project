"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { Star, Check, X, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export function ReviewsTable() {
  const [data, setData] = useState<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/reviews?${params}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [page, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggleApprove(review: any) {
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !review.approved }),
      });
      if (res.ok) {
        toast.success(
          `Review ${!review.approved ? "approved & published" : "hidden from storefront"}`
        );
        loadData();
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this customer review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        loadData();
      }
    } catch {
      toast.error("Failed to delete review");
    }
  }

  if (!data) return <div className="text-muted-foreground p-6">Loading reviews…</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          className="rounded-lg border border-border px-3 py-2 text-sm bg-background text-foreground"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All reviews</option>
          <option value="approved">Approved only</option>
          <option value="pending">Pending moderation</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No reviews found matching your filter.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted border border-border">
                        {r.product?.images?.[0] ? (
                          <Image
                            src={r.product.images[0]}
                            alt={r.product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <Link
                        href={`/products/${r.product?.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-foreground hover:text-primary max-w-[140px] truncate"
                      >
                        {r.product?.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-foreground">{r.user?.name}</div>
                    <div className="text-[11px] text-muted-foreground">{r.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-foreground">{r.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {r.title && (
                      <p className="text-xs font-bold text-foreground truncate">{r.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    {r.approved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleApprove(r)}
                        title={r.approved ? "Hide from site" : "Approve & Publish"}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        {r.approved ? (
                          <X className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Check className="h-4 w-4 text-emerald-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(r.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <DataTablePagination
          page={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

