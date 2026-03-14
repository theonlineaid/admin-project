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
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { LOCALES } from "@/lib/locales";

type AttributeOption = {
  id?: string;
  value: string;
  sortOrder?: number;
  valueTranslations?: Record<string, string>;
};

type Attribute = {
  id: string;
  name: string;
  nameTranslations?: Record<string, string> | null;
  slug: string;
  type: string;
  sortOrder: number;
  options: AttributeOption[];
  _count?: { productAttributes: number };
};

type OptionRow = { value: string; valueTranslations: Record<string, string> };

export function AttributesTable() {
  const [list, setList] = useState<Attribute[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Attribute | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"select" | "text" | "number">("select");
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [nameTranslations, setNameTranslations] = useState<Record<string, string>>({});
  const [showTranslations, setShowTranslations] = useState(false);
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/attributes")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }

  useEffect(() => load(), []);

  function openCreate() {
    setEdit(null);
    setName("");
    setSlug("");
    setType("select");
    setOptions([{ value: "", valueTranslations: {} }]);
    setNameTranslations({});
    setShowTranslations(false);
    setOpen(true);
  }

  function openEdit(a: Attribute) {
    setEdit(a);
    setName(a.name);
    setSlug(a.slug);
    setType(a.type as "select" | "text" | "number");
    setOptions(
      a.options?.length
        ? a.options.map((o) => ({
            value: o.value,
            valueTranslations: (o.valueTranslations as Record<string, string>) ?? {},
          }))
        : [{ value: "", valueTranslations: {} }]
    );
    setNameTranslations((a.nameTranslations as Record<string, string>) ?? {});
    setShowTranslations(false);
    setOpen(true);
  }

  function addOption() {
    setOptions((prev) => [...prev, { value: "", valueTranslations: {} }]);
  }

  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function setOptionValue(i: number, value: string) {
    setOptions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], value };
      return next;
    });
  }

  function setNameTranslation(locale: string, value: string) {
    setNameTranslations((prev) => {
      const next = { ...prev };
      if (value.trim()) next[locale] = value;
      else delete next[locale];
      return next;
    });
  }

  function setOptionValueTranslation(optionIndex: number, locale: string, value: string) {
    setOptions((prev) => {
      const next = [...prev];
      const trans = { ...(next[optionIndex].valueTranslations ?? {}) };
      if (value.trim()) trans[locale] = value;
      else delete trans[locale];
      next[optionIndex] = { ...next[optionIndex], valueTranslations: trans };
      return next;
    });
  }

  async function save() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const opts =
      type === "select"
        ? options.map((o) => ({ value: o.value.trim(), valueTranslations: o.valueTranslations })).filter((o) => o.value)
        : [];
    setLoading(true);
    const url = edit ? `/api/attributes/${edit.id}` : "/api/attributes";
    const method = edit ? "PUT" : "POST";
    const nameTrans =
      Object.keys(nameTranslations).length > 0
        ? Object.fromEntries(
            Object.entries(nameTranslations).filter(([, v]) => v != null && String(v).trim() !== "")
          )
        : undefined;
    const body: Record<string, unknown> = {
      name: trimmedName,
      type,
      nameTranslations: nameTrans,
      options:
        type === "select" && opts.length
          ? opts.map((o) => ({
              value: o.value,
              valueTranslations:
                Object.keys(o.valueTranslations ?? {}).length > 0
                  ? Object.fromEntries(
                      Object.entries(o.valueTranslations ?? {}).filter(
                        ([, v]) => v != null && String(v).trim() !== ""
                      )
                    )
                  : undefined,
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
      const err = await res.json();
      alert(err.error?.name?.join?.(" ") || err.error || "Failed to save");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this attribute? Product values for this attribute will be removed.")) return;
    const res = await fetch(`/api/attributes/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("Failed to delete");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add attribute
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Options / Usage</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.slug}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  {row.type === "select" && row.options?.length
                    ? row.options.map((o) => o.value).join(", ")
                    : row._count?.productAttributes != null
                    ? `Used on ${row._count.productAttributes} product(s)`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => remove(row.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="max-w-md">
          <DialogHeader>
            <DialogTitle>{edit ? "Edit attribute" : "New attribute"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Clothing Size, Sneaker Size, Weight"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (optional)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated if empty"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as "select" | "text" | "number")}
              >
                <option value="select">Select (predefined options, e.g. S, M, L)</option>
                <option value="text">Text (free text per product)</option>
                <option value="number">Number (e.g. weight in kg)</option>
              </select>
            </div>
            {type === "select" && (
              <div className="space-y-2">
                <Label>Options (one per product choice)</Label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={opt.value}
                        onChange={(e) => setOptionValue(i, e.target.value)}
                        placeholder="e.g. S, M, L or 38, 39, 40"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => removeOption(i)} aria-label="Remove option">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" /> Add option
                  </Button>
                </div>
              </div>
            )}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setShowTranslations((v) => !v)}
              >
                {showTranslations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Multi-language translations (optional)
              </button>
              {showTranslations && (
                <div className="mt-3 space-y-4 pl-0">
                  <p className="text-xs text-muted-foreground">
                    Default name and option values above are used when no translation exists. Add translations for other locales.
                  </p>
                  {LOCALES.filter((l) => l.code !== "en").map((loc) => (
                    <div key={loc.code} className="space-y-2 rounded-md border border-border p-3">
                      <Label className="text-muted-foreground">{loc.name} ({loc.code})</Label>
                      <Input
                        placeholder={`Attribute name in ${loc.name}`}
                        value={nameTranslations[loc.code] ?? ""}
                        onChange={(e) => setNameTranslation(loc.code, e.target.value)}
                      />
                      {type === "select" &&
                        options.map(
                          (opt, i) =>
                            opt.value && (
                              <Input
                                key={i}
                                placeholder={`"${opt.value}" in ${loc.name}`}
                                value={opt.valueTranslations?.[loc.code] ?? ""}
                                onChange={(e) =>
                                  setOptionValueTranslation(i, loc.code, e.target.value)
                                }
                              />
                            )
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
