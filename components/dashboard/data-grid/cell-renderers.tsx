"use client";

import Link from "next/link";
import type { CustomCellRendererProps } from "ag-grid-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { DataGridActionsContext } from "./data-grid-types";

export function GridImageCell(props: CustomCellRendererProps) {
  const url = props.value as string | null | undefined;
  const imgClass =
    (props.colDef?.cellRendererParams as { imgClassName?: string } | undefined)?.imgClassName ??
    "h-9 w-9 rounded-md object-cover border border-border my-0.5";
  if (!url) return <span className="text-muted-foreground text-xs">—</span>;
  // Cloudinary URLs; avoid next/image remotePatterns maintenance for admin thumbs
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className={imgClass} />;
}

export function GridActionsEditDelete(props: CustomCellRendererProps) {
  const ctx = props.context as DataGridActionsContext | undefined;
  const row = props.data as { id?: string } | undefined;
  const id = row?.id;
  if (!id || !ctx) return null;
  return (
    <div className="flex items-center gap-0.5 h-full">
      {ctx.onEdit && (
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => ctx.onEdit!(props.data)}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {ctx.onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600"
          onClick={() => ctx.onDelete!(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

type BadgeMap = Record<string, "default" | "success" | "warning" | "destructive" | "secondary">;

export function GridBadgeCell(
  props: CustomCellRendererProps & { variantMap?: BadgeMap; fallback?: "default" | "secondary" }
) {
  const v = String(props.value ?? "");
  const map = (props.variantMap ?? props.colDef?.cellRendererParams?.variantMap) as BadgeMap | undefined;
  const variant = map?.[v] ?? props.fallback ?? "secondary";
  return <Badge variant={variant}>{v}</Badge>;
}

export function GridLinkButtonCell(
  props: CustomCellRendererProps & {
    getHref?: (data: unknown) => string;
    label?: string;
  }
) {
  const params = props.colDef?.cellRendererParams as { getHref?: (d: unknown) => string; label?: string } | undefined;
  const getHref = props.getHref ?? params?.getHref;
  const label = props.label ?? params?.label ?? "Open";
  if (!getHref || !props.data) return null;
  return (
    <Link href={getHref(props.data)}>
      <Button variant="ghost" size="sm">
        {label}
      </Button>
    </Link>
  );
}

type ProductRow = { id: string };
type CustomerRow = { id: string; name: string };

export function GridProductActionsCell(
  props: CustomCellRendererProps<ProductRow, unknown, { onDeleteProduct?: (id: string) => void }>
) {
  const id = props.data?.id;
  if (!id) return null;
  return (
    <div className="flex gap-1 items-center h-full">
      <Link href={`/dashboard/products/edit/${id}`}>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700"
        onClick={() => props.context?.onDeleteProduct?.(id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function GridCustomerActionsCell(
  props: CustomCellRendererProps<CustomerRow, unknown, { onDeleteCustomer?: (id: string, name: string) => void }>
) {
  const row = props.data;
  if (!row?.id) return null;
  return (
    <div className="flex items-center gap-1 h-full flex-wrap">
      <Link href={`/dashboard/customers/${row.id}`}>
        <Button type="button" variant="ghost" size="sm">
          View
        </Button>
      </Link>
      <Link href={`/dashboard/users/edit/${row.id}`}>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700"
        title="Delete"
        onClick={() => props.context?.onDeleteCustomer?.(row.id, row.name)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
