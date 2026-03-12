"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  limit?: number;
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
  total,
  limit,
}: DataTablePaginationProps) {
  const start = total !== undefined && limit ? (page - 1) * limit + 1 : null;
  const end = total !== undefined && limit ? Math.min(page * limit, total) : null;

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <div className="text-sm text-slate-600">
        {start != null && end != null && total != null && (
          <span>
            Showing {start}-{end} of {total}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-slate-600">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
