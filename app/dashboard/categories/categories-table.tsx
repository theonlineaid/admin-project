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
import { Pencil, Trash2, Plus } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number; subcategories: number };
};

export function CategoriesTable() {
  const [list, setList] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }

  useEffect(() => load(), []);

  function openCreate() {
    setEdit(null);
    setName("");
    setSlug("");
    setDescription("");
    setOpen(true);
  }

  function openEdit(c: Category) {
    setEdit(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description ?? "");
    setOpen(true);
  }

  async function save() {
    setLoading(true);
    const url = edit ? `/api/categories/${edit.id}` : "/api/categories";
    const method = edit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined, description: description || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add category
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.slug}</TableCell>
                <TableCell>{row._count.subcategories}</TableCell>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
