"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { DataGrid, GridActionsEditDelete } from "@/components/dashboard/data-grid";

type AttributeOption = {
  id?: string;
  value: string;
  slug?: string | null;
  hex?: string | null;
  sortOrder?: number;
};

type Attribute = {
  id: string;
  name: string;
  slug: string;
  type: string;
  sortOrder: number;
  options: AttributeOption[];
  _count?: { productAttributes: number };
};

type OptionRow = { value: string; slug: string; hex: string };

async function formatApiError(res: Response): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as {
    error?: string | Record<string, string[] | string>;
  };
  if (typeof j.error === "string") return j.error;
  if (j.error && typeof j.error === "object") {
    const lines = Object.entries(j.error).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((x) => `${k}: ${x}`) : [`${k}: ${String(v)}`],
    );
    if (lines.length) return lines.join("\n");
  }
  return `Request failed (${res.status})`;
}

function optionsSummary(row: Attribute | undefined): string {
  if (!row) return "";
  if (row.type === "select" && row.options?.length) {
    return row.options.map((o) => o.value).join(", ");
  }
  if (row._count?.productAttributes != null) {
    return `Used on ${row._count.productAttributes} product(s)`;
  }
  return "—";
}

const attributeColumnDefs: ColDef<Attribute>[] = [
  { field: "name", headerName: "Label" },
  { field: "slug", headerName: "Key" },
  { field: "type", headerName: "Type", maxWidth: 120, flex: 0 },
  {
    colId: "optionsSummary",
    headerName: "Options / Usage",
    flex: 2,
    valueGetter: (p) => optionsSummary(p.data),
    filterValueGetter: (p) => optionsSummary(p.data),
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

export function AttributesTable() {
  const [list, setList] = useState<Attribute[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Attribute | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"select" | "text" | "number">("select");
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    fetch("/api/attributes")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => load(), [load]);

  function openCreate() {
    setEdit(null);
    setName("");
    setSlug("");
    setType("select");
    setOptions([{ value: "", slug: "", hex: "" }]);
    setOpen(true);
  }

  const openEdit = useCallback((a: Attribute) => {
    setEdit(a);
    setName(a.name);
    setSlug(a.slug);
    setType(a.type as "select" | "text" | "number");
    setOptions(
      a.options?.length
        ? a.options.map((o) => ({
            value: o.value,
            slug: o.slug ?? "",
            hex: o.hex ?? "",
          }))
        : [{ value: "", slug: "", hex: "" }],
    );
    setOpen(true);
  }, []);

  function addOption() {
    setOptions((prev) => [...prev, { value: "", slug: "", hex: "" }]);
  }

  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function patchOption(i: number, patch: Partial<OptionRow>) {
    setOptions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i]!, ...patch };
      return next;
    });
  }

  function presetClothingSizes() {
    setName("Size");
    setSlug("clothing-size");
    setType("select");
    setOptions(
      ["S", "M", "L", "XL", "XXL"].map((v) => ({
        value: v,
        slug: v.toLowerCase(),
        hex: "",
      })),
    );
  }

  function presetEuShoesFull() {
    setName("EU shoe size");
    setSlug("eu-shoe-size");
    setType("select");
    setOptions(
      Array.from({ length: 13 }, (_, i) => String(36 + i)).map((v) => ({
        value: v,
        slug: v,
        hex: "",
      })),
    );
  }

  function presetSneakerRange() {
    setName("EU shoe size");
    setSlug("eu-sneaker-size");
    setType("select");
    setOptions(
      ["40", "41", "42", "43", "44", "45"].map((v) => ({
        value: v,
        slug: v,
        hex: "",
      })),
    );
  }

  async function save() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const opts =
      type === "select"
        ? options
            .map((o) => ({
              value: o.value.trim(),
              slug: o.slug.trim() || null,
              hex: o.hex.trim() || null,
            }))
            .filter((o) => o.value)
        : [];
    if (type === "select" && opts.length === 0) {
      alert(
        "Select attributes need at least one value. Fill the Name column or click a quick template (Clothing / Shoes).",
      );
      return;
    }
    setLoading(true);
    const url = edit ? `/api/attributes/${edit.id}` : "/api/attributes";
    const method = edit ? "PUT" : "POST";
    const body: Record<string, unknown> = {
      name: trimmedName,
      type,
      options:
        type === "select" && opts.length
          ? opts.map((o) => ({
              value: o.value,
              slug: o.slug,
              hex: o.hex,
            }))
          : undefined,
    };
    if (slug.trim()) body.slug = slug.trim();
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      load();
    } else {
      alert(await formatApiError(res));
    }
  }

  const remove = useCallback(
    async (id: string) => {
      if (!confirm("Delete this attribute? Product values for this attribute will be removed.")) return;
      const res = await fetch(`/api/attributes/${id}`, { method: "DELETE" });
      if (res.ok) load();
      else alert(await formatApiError(res));
    },
    [load],
  );

  const gridContext = useMemo(
    () => ({
      onEdit: (row: unknown) => openEdit(row as Attribute),
      onDelete: (id: string) => {
        void remove(id);
      },
    }),
    [openEdit, remove],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add attribute
        </Button>
      </div>
      <DataGrid<Attribute>
        rowData={list}
        columnDefs={attributeColumnDefs}
        context={gridContext}
        getRowId={({ data }) => data.id}
        paginationPageSize={25}
      />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:mx-4"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border px-6 pt-6 pb-3">
            <DialogHeader>
              <DialogTitle>{edit ? "Edit attribute" : "New attribute"}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-4">
            <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label (shown on storefront)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. "Size", "Color"'
              />
            </div>
            <div className="space-y-2">
              <Label>Key / slug (optional)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. clothing-size, eu-shoe-size (must be unique)"
              />
              <p className="text-xs text-muted-foreground">
                Use a different key for each kind of size (shirts vs sneakers) so nothing collides with &quot;size&quot;.
              </p>
            </div>
            {type === "select" && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-medium text-foreground">Quick templates</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={presetClothingSizes}>
                    Clothing S–XXL
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={presetEuShoesFull}>
                    Shoes EU 36–48
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={presetSneakerRange}>
                    Sneakers 40–45
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as "select" | "text" | "number")}
              >
                <option value="select">Select (S, M, L or color names)</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
              </select>
            </div>
            {type === "select" && (
              <div className="space-y-2">
                <Label>Values</Label>
                <p className="text-xs text-muted-foreground">
                  Name = button label. Optional slug for APIs; hex (#RRGGBB) shows a color dot on the product page.
                </p>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:flex-wrap sm:items-end">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-xs text-muted-foreground">Name</span>
                        <Input
                          value={opt.value}
                          onChange={(e) => patchOption(i, { value: e.target.value })}
                          placeholder="Small, Medium, Black…"
                        />
                      </div>
                      <div className="w-full space-y-1 sm:w-24">
                        <span className="text-xs text-muted-foreground">Slug</span>
                        <Input
                          value={opt.slug}
                          onChange={(e) => patchOption(i, { slug: e.target.value })}
                          placeholder="s, m"
                        />
                      </div>
                      <div className="w-full space-y-1 sm:w-28">
                        <span className="text-xs text-muted-foreground">Hex</span>
                        <Input
                          value={opt.hex}
                          onChange={(e) => patchOption(i, { hex: e.target.value })}
                          placeholder="#000000"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeOption(i)}
                        aria-label="Remove option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="mr-1 h-4 w-4" /> Add value
                  </Button>
                </div>
              </div>
            )}
            </div>
          </div>
          <div className="shrink-0 border-t border-border bg-card px-6 py-4">
            <DialogFooter className="mt-0">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={loading}>
                {loading ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
