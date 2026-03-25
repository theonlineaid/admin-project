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

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count: { products: number; subcategories: number };
};

const categoryColumnDefs: ColDef<Category>[] = [
  {
    field: "imageUrl",
    headerName: "Image",
    cellRenderer: GridImageCell,
    maxWidth: 100,
    flex: 0,
    filter: false,
    sortable: false,
  },
  { field: "name", headerName: "Name" },
  { field: "slug", headerName: "Slug" },
  {
    colId: "subcategories",
    headerName: "Subcategories",
    valueGetter: (p) => p.data?._count.subcategories ?? 0,
    maxWidth: 140,
    flex: 0,
  },
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

export function CategoriesTable() {
  const [list, setList] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => load(), [load]);

  function openCreate() {
    setEdit(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setOpen(true);
  }

  const openEdit = useCallback((c: Category) => {
    setEdit(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description ?? "");
    setImageUrl(c.imageUrl ?? "");
    setOpen(true);
  }, []);

  const remove = useCallback(
    async (id: string) => {
      if (!confirm("Delete this category?")) return;
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) load();
    },
    [load]
  );

  const gridContext = useMemo(
    () => ({
      onEdit: (row: unknown) => openEdit(row as Category),
      onDelete: (id: string) => {
        void remove(id);
      },
    }),
    [openEdit, remove]
  );

  async function save() {
    setLoading(true);
    const url = edit ? `/api/categories/${edit.id}` : "/api/categories";
    const method = edit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slug || undefined,
        description: description || undefined,
        imageUrl: imageUrl.trim() || null,
      }),
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
          Add category
        </Button>
      </div>
      <DataGrid<Category>
        rowData={list}
        columnDefs={categoryColumnDefs}
        context={gridContext}
        getRowId={({ data }) => data.id}
        paginationPageSize={25}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>{edit ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug (optional)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated if empty" />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <CloudinaryImageField
            label="Category image"
            folder="categories"
            value={imageUrl}
            onChange={setImageUrl}
            hint="Uploaded to Cloudinary folder: categories"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
