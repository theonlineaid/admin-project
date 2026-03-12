"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";

type Subcategory = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category: { id: string; name: string };
  _count: { products: number };
};

type Category = { id: string; name: string };

export function SubcategoriesTable() {
  const [list, setList] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Subcategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/subcategories")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }

  useEffect(() => load(), []);

  function openCreate() {
    setEdit(null);
    setName("");
    setSlug("");
    setCategoryId(categories[0]?.id ?? "");
    setOpen(true);
  }

  function openEdit(s: Subcategory) {
    setEdit(s);
    setName(s.name);
    setSlug(s.slug);
    setCategoryId(s.categoryId);
    setOpen(true);
  }

  async function save() {
    if (!categoryId && !edit) return;
    setLoading(true);
    const url = edit ? `/api/subcategories/${edit.id}` : "/api/subcategories";
    const method = edit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined, categoryId: categoryId || edit?.categoryId }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this subcategory?")) return;
    const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} disabled={categories.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add subcategory
        </Button>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.slug}</TableCell>
                <TableCell>{row.category.name}</TableCell>
                <TableCell>{row._count.products}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => remove(row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
                <option key={c.id} value={c.id}>{c.name}</option>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={loading}>Save</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
