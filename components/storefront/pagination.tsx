"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DataTablePagination } from "@/components/tables/data-table-pagination";

export function StorefrontPagination({
  page,
  totalPages,
  total,
  limit,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/products?${params.toString()}`);
  }

  return (
    <DataTablePagination
      page={page}
      totalPages={totalPages}
      total={total}
      limit={limit}
      onPageChange={goTo}
    />
  );
}
