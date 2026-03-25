"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { CloudinaryImageField } from "@/components/dashboard/cloudinary-image-field";
import {
  DataGrid,
  GridActionsEditDelete,
  GridImageCell,
} from "@/components/dashboard/data-grid";

type Brand = {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
  _count: { products: number };
};

const brandColumnDefs: ColDef<Brand>[] = [
  {
    field: "logo",
    headerName: "Logo",
    cellRenderer: GridImageCell,
    cellRendererParams: {
      imgClassName: "h-9 w-9 rounded-md object-contain border border-border bg-muted/30 my-0.5",
    },
    maxWidth: 100,
    flex: 0,
    filter: false,
    sortable: false,
  },
  { field: "name", headerName: "Name" },
  { field: "slug", headerName: "Slug" },
  {
    colId: "products",
    headerName: "Products",
    valueGetter: (p) => p.data?._count.products ?? 0,
    maxWidth: 120,
    flex: 0,
  },
  {
    colId: "actions",
    headerName: "",
    maxWidth: 120,
    flex: 0,
    cellRenderer: GridActionsEditDelete,
    filter: false,
    sortable: false,
    pinned: "right",
  },
];

export function BrandsTable() {
  const [list, setList] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => load(), [load]);

  function openCreate() {
    setEdit(null);
    setName("");
    setSlug("");
    setLogo("");
    setOpen(true);
  }

  const openEdit = useCallback((b: Brand) => {
    setEdit(b);
    setName(b.name);
    setSlug(b.slug);
    setLogo(b.logo ?? "");
    setOpen(true);
  }, []);

  const remove = useCallback(
    async (id: string) => {
      if (!confirm("Delete this brand?")) return;
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (res.ok) load();
    },
    [load]
  );

  const gridContext = useMemo(
    () => ({
      onEdit: (row: unknown) => openEdit(row as Brand),
      onDelete: (id: string) => {
        void remove(id);
      },
    }),
    [openEdit, remove]
  );

  async function save() {
    setLoading(true);
    const url = edit ? `/api/brands/${edit.id}` : "/api/brands";
    const method = edit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined, logo: logo.trim() || null }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      load();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add brand
        </Button>
      </div>
      <DataGrid<Brand>
        rowData={list}
        columnDefs={brandColumnDefs}
        context={gridContext}
        getRowId={({ data }) => data.id}
        paginationPageSize={25}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>{edit ? "Edit brand" : "New brand"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug (optional)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <CloudinaryImageField
            label="Brand logo"
            folder="brands"
            value={logo}
            onChange={setLogo}
            hint="Uploaded to Cloudinary folder: brands"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={loading}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
