"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CloudinaryImageField } from "@/components/dashboard/cloudinary-image-field";
import {
  DataGrid,
  GridActionsEditDelete,
  GridImageCell,
} from "@/components/dashboard/data-grid";

type Subcategory = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  imageUrl: string | null;
  category: { id: string; name: string };
  _count: { products: number };
};

type Category = { id: string; name: string };

const subcategoryColumnDefs: ColDef<Subcategory>[] = [
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
    colId: "categoryName",
    headerName: "Category",
    valueGetter: (p) => p.data?.category.name ?? "",
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

export function SubcategoriesTable() {
  const [list, setList] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Subcategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    fetch("/api/subcategories")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => load(), [load]);

  function openCreate() {
    setEdit(null);
    setName("");
    setSlug("");
    setCategoryId(categories[0]?.id ?? "");
    setImageUrl("");
    setOpen(true);
  }

  const openEdit = useCallback((s: Subcategory) => {
    setEdit(s);
    setName(s.name);
    setSlug(s.slug);
    setCategoryId(s.categoryId);
    setImageUrl(s.imageUrl ?? "");
    setOpen(true);
  }, []);

  const remove = useCallback(
    async (id: string) => {
      if (!confirm("Delete this subcategory?")) return;
      const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
      if (res.ok) load();
    },
    [load]
  );

  const gridContext = useMemo(
    () => ({
      onEdit: (row: unknown) => openEdit(row as Subcategory),
      onDelete: (id: string) => {
        void remove(id);
      },
    }),
    [openEdit, remove]
  );

  async function save() {
    if (!categoryId && !edit) return;
    setLoading(true);
    const url = edit ? `/api/subcategories/${edit.id}` : "/api/subcategories";
    const method = edit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slug || undefined,
        categoryId: categoryId || edit?.categoryId,
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
        <Button onClick={openCreate} disabled={categories.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add subcategory
        </Button>
      </div>
      <DataGrid<Subcategory>
        rowData={list}
        columnDefs={subcategoryColumnDefs}
        context={gridContext}
        getRowId={({ data }) => data.id}
        paginationPageSize={25}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>{edit ? "Edit subcategory" : "New subcategory"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={!!edit}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug (optional)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <CloudinaryImageField
            label="Subcategory image"
            folder="subcategories"
            value={imageUrl}
            onChange={setImageUrl}
            hint="Uploaded to Cloudinary folder: subcategories"
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
