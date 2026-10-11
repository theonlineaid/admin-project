"use client";

import { useEffect, useState, useCallback } from "react";
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
import { CouponFormDialog } from "./coupon-form-dialog";
import { Edit2, Trash2, Power, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export function CouponsTable() {
  const [data, setData] = useState<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  const loadData = useCallback(() => {
    fetch(`/api/coupons?page=${page}&limit=10`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggleStatus(coupon: any) {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (res.ok) {
        toast.success(`Coupon ${coupon.code} ${!coupon.isActive ? "activated" : "deactivated"}`);
        loadData();
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Coupon deleted");
        loadData();
      }
    } catch {
      toast.error("Failed to delete coupon");
    }
  }

  if (!data) return <div className="text-muted-foreground p-6">Loading coupons…</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingCoupon(null);
            setDialogOpen(true);
          }}
          className="gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No coupons found. Click &quot;Create Coupon&quot; to add your first promotion.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((c) => {
                const now = new Date();
                const isExpired = c.endDate && new Date(c.endDate) < now;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold text-foreground">
                      {c.code}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">
                        {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                      </span>
                      {c.minOrderAmount && (
                        <span className="block text-[11px] text-muted-foreground">
                          Min. order: ${c.minOrderAmount}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {c.usedCount}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {c.usageLimit ? ` / ${c.usageLimit}` : " uses"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.startDate ? formatDate(c.startDate) : "Anytime"} &rarr;{" "}
                      {c.endDate ? formatDate(c.endDate) : "Ongoing"}
                    </TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : c.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(c)}
                          title={c.isActive ? "Deactivate" : "Activate"}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Power className={`h-4 w-4 ${c.isActive ? "text-emerald-500" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCoupon(c);
                            setDialogOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id, c.code)}
                          className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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

      {dialogOpen && (
        <CouponFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          coupon={editingCoupon}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

