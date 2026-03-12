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

type Brand = {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
  _count: { products: number };
};

export function BrandsTable() {
  const [list, setList] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }

  useEffect(() => load(), []);

  function openCreate() {
    setEdit(null);
    setName("");
    setSlug("");
    setLogo("");
    setOpen(true);
  }

  function openEdit(b: Brand) {
    setEdit(b);
    setName(b.name);
    setSlug(b.slug);
    setLogo(b.logo ?? "");
    setOpen(true);
  }

  async function save() {
    setLoading(true);
    const url = edit ? `/api/brands/${edit.id}` : "/api/brands";
    const method = edit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined, logo: logo || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this brand?")) return;
    const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add brand
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.slug}</TableCell>
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
          <div className="space-y-2">
            <Label>Logo URL (optional)</Label>
            <Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." />
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
