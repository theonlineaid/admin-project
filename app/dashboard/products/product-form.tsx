"use client";

/* eslint-disable react-hooks/incompatible-library -- React Hook Form watch() used for categoryId filter */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductAttributeInput } from "@/lib/product-attribute-input";
import { cn, slugify } from "@/lib/utils";

function CopyIdButton({ id, noun }: { id: string; noun: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-6 shrink-0 px-1.5 text-[10px]"
      onClick={() => {
        void navigator.clipboard.writeText(id).then(
          () => {
            setOk(true);
            setTimeout(() => setOk(false), 1200);
          },
          () => {
            alert(`Could not copy. ${noun} id:\n${id}`);
          },
        );
      }}
    >
      {ok ? "Copied" : "Copy"}
    </Button>
  );
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  status: z.string(),
});

type FormValues = z.infer<typeof schema>;

type AttributeOption = { id: string; value: string; sortOrder: number };
type AttributeWithOptions = {
  id: string;
  name: string;
  slug: string;
  type: string;
  sortOrder?: number;
  options?: AttributeOption[] | null;
};
type ProductAttributeValue = {
  attributeId: string;
  /** Select-type: any number of options (e.g. S + M + L on one product). */
  selectedOptionIds: string[];
  valueText: string | null;
};

export function ProductForm({
  product,
}: {
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: { toString(): string };
    compareAtPrice: { toString(): string } | null;
    stock: number;
    sku: string | null;
    categoryId: string;
    subcategoryId: string | null;
    brandId: string | null;
    status: string;
    images: string[];
    productAttributes?: {
      attributeId: string;
      attributeOptionId: string | null;
      valueText: string | null;
      attribute: { id: string; name: string; type: string };
      attributeOption: { id: string; value: string } | null;
    }[];
  };
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [attributes, setAttributes] = useState<AttributeWithOptions[]>([]);
  const [productAttributes, setProductAttributes] = useState<ProductAttributeValue[]>([]);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? "",
          price: parseFloat(product.price.toString()),
          compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : null,
          stock: product.stock,
          sku: product.sku ?? "",
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          brandId: product.brandId,
          status: product.status,
        }
      : {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          status: "draft",
        },
  });

  // React Hook Form watch() is not memoizable; acceptable for form-driven subcategory filter
  const categoryId = watch("categoryId");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(console.error);
    fetch("/api/brands")
      .then((r) => r.json())
      .then((list) => setBrands(Array.isArray(list) ? list : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/subcategories")
      .then((r) => r.json())
      .then((list) => setSubcategories(Array.isArray(list) ? list : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/attributes", { cache: "no-store" })
      .then((r) => r.json())
      .then((list) => {
        const attrs = Array.isArray(list) ? list : [];
        setAttributes(attrs);
        const savedByAttrId = new Map<
          string,
          { optionIds: string[]; valueText: string | null }
        >();
        for (const pa of product?.productAttributes ?? []) {
          let g = savedByAttrId.get(pa.attributeId);
          if (!g) {
            g = { optionIds: [], valueText: null };
            savedByAttrId.set(pa.attributeId, g);
          }
          if (pa.attributeOptionId) g.optionIds.push(pa.attributeOptionId);
          const vt = pa.valueText?.trim();
          if (vt) g.valueText = vt;
        }
        if (attrs.length > 0) {
          setProductAttributes(
            attrs.map((a: AttributeWithOptions) => {
              const saved = savedByAttrId.get(a.id);
              return {
                attributeId: a.id,
                selectedOptionIds: saved?.optionIds ?? [],
                valueText: saved?.valueText ?? null,
              };
            }),
          );
        } else if (product?.productAttributes?.length) {
          setProductAttributes(
            [...savedByAttrId.entries()].map(([attributeId, g]) => ({
              attributeId,
              selectedOptionIds: g.optionIds,
              valueText: g.valueText,
            })),
          );
        }
      })
      .catch(console.error);
  }, [product?.id]);

  const filteredSubcategories = subcategories.filter((s) => s.categoryId === categoryId);

  function getAttributeValue(attributeId: string): ProductAttributeValue {
    return productAttributes.find((pa) => pa.attributeId === attributeId) ?? {
      attributeId,
      selectedOptionIds: [],
      valueText: null,
    };
  }

  function setAttributeValue(attributeId: string, update: Partial<ProductAttributeValue>) {
    setProductAttributes((prev) => {
      const idx = prev.findIndex((pa) => pa.attributeId === attributeId);
      const next =
        idx >= 0
          ? [...prev]
          : [...prev, { attributeId, selectedOptionIds: [], valueText: null }];
      const i = idx >= 0 ? idx : next.length - 1;
      next[i] = { ...next[i], ...update };
      return next;
    });
  }

  function toggleSelectOption(attributeId: string, optionId: string) {
    setProductAttributes((prev) =>
      prev.map((row) => {
        if (row.attributeId !== attributeId) return row;
        const set = new Set(row.selectedOptionIds);
        if (set.has(optionId)) set.delete(optionId);
        else set.add(optionId);
        return { ...row, selectedOptionIds: [...set] };
      }),
    );
  }

  function setAllSelectOptions(attributeId: string, optionIds: string[]) {
    setAttributeValue(attributeId, { selectedOptionIds: [...optionIds] });
  }

  function clearSelectOptions(attributeId: string) {
    setAttributeValue(attributeId, { selectedOptionIds: [] });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "products");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : res.statusText || "Upload failed";
        throw new Error(msg);
      }
      if (data?.url) {
        setImages((prev) => [...prev, data.url]);
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function onSubmit(values: FormValues) {
    const paPayload: ProductAttributeInput[] = [];
    for (const row of productAttributes) {
      const attr = attributes.find((a) => a.id === row.attributeId);
      const typeNorm = String(attr?.type ?? "")
        .toLowerCase()
        .trim();
      const options = Array.isArray(attr?.options) ? attr.options : [];
      if (typeNorm === "select") {
        const allIds = options.map((o) => o.id);
        const allSelected =
          allIds.length > 0 &&
          allIds.every((oid) => row.selectedOptionIds.includes(oid));
        if (allSelected) {
          paPayload.push({
            attributeId: row.attributeId,
            allOptions: true,
            attributeOptionId: undefined,
            valueText: undefined,
          });
        } else {
          for (const oid of row.selectedOptionIds) {
            paPayload.push({
              attributeId: row.attributeId,
              attributeOptionId: oid,
              valueText: undefined,
            });
          }
        }
      } else if (row.valueText != null && String(row.valueText).trim() !== "") {
        paPayload.push({
          attributeId: row.attributeId,
          attributeOptionId: undefined,
          valueText: String(row.valueText).trim(),
        });
      }
    }
    const payload = {
      ...values,
      compareAtPrice: values.compareAtPrice || undefined,
      subcategoryId: values.subcategoryId || undefined,
      brandId: values.brandId || undefined,
      images,
      productAttributes: paPayload,
    };
    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to save");
      return;
    }
    router.push("/dashboard/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-lg border border-border px-3 py-2 text-sm"
              {...register("description")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at price (optional)</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                {...register("compareAtPrice", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                {...register("categoryId", {
                  onChange: () => setValue("subcategoryId", ""),
                })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select {...register("subcategoryId")}>
                <option value="">None</option>
                {filteredSubcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select {...register("brandId")}>
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select {...register("status")}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          {attributes.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Label>Attributes (size, color, etc.)</Label>
                <span className="text-xs text-muted-foreground">
                  {attributes.length} attribute{attributes.length === 1 ? "" : "s"} from catalog
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Each block lists the catalog attribute id (copy for APIs). For selects, use Whole attribute to attach
                every option id at once, or tick individual values. JSON body can send{" "}
                <code className="rounded bg-muted px-1 text-xs">
                  {`{ "attributeId": "<id>", "allOptions": true }`}
                </code>
                . Add more rows in{" "}
                <Link
                  href="/dashboard/attributes"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Dashboard → Attributes
                </Link>
                .
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {attributes.map((attr) => {
                  const value = getAttributeValue(attr.id);
                  const typeNorm = String(attr.type ?? "")
                    .toLowerCase()
                    .trim();
                  const options = Array.isArray(attr.options) ? attr.options : [];
                  const optionIdSet = new Set(options.map((o) => o.id));
                  const selected = new Set(value.selectedOptionIds);
                  const staleIds = value.selectedOptionIds.filter((id) => !optionIdSet.has(id));
                  return (
                    <div key={attr.id} className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">
                          {attr.name}
                          {attr.slug && attr.slug !== slugify(attr.name) ? (
                            <span className="ml-1 font-normal text-muted-foreground/80">
                              ({attr.slug})
                            </span>
                          ) : null}
                        </Label>
                        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
                          <span className="font-mono break-all">
                            id: {attr.id}
                          </span>
                          <CopyIdButton id={attr.id} noun="Attribute" />
                          <span className="hidden sm:inline">·</span>
                          <span className="font-mono">key: {attr.slug}</span>
                        </div>
                      </div>
                      {typeNorm === "select" ? (
                        <div className="space-y-2">
                          {options.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() =>
                                  setAllSelectOptions(
                                    attr.id,
                                    options.map((o) => o.id),
                                  )
                                }
                              >
                                Whole attribute (all option IDs)
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => clearSelectOptions(attr.id)}
                              >
                                Clear selection
                              </Button>
                            </div>
                          )}
                          {staleIds.length > 0 && (
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                              Saved option id(s) no longer in catalog — remove or fix in Attributes.
                            </p>
                          )}
                          {options.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No values yet — add them in Dashboard → Attributes.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2 rounded-lg border border-border p-3">
                              {options.map((opt) => (
                                <label
                                  key={opt.id}
                                  title={`Option id: ${opt.id}`}
                                  className={cn(
                                    "flex min-w-[6rem] cursor-pointer flex-col gap-0.5 rounded-md border px-2 py-2 text-sm transition-colors sm:min-w-0 sm:flex-row sm:items-center sm:gap-2 sm:px-3",
                                    selected.has(opt.id)
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:bg-muted/60",
                                  )}
                                >
                                  <span className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      className="size-4 shrink-0 rounded border-border"
                                      checked={selected.has(opt.id)}
                                      onChange={() => toggleSelectOption(attr.id, opt.id)}
                                    />
                                    <span>{opt.value}</span>
                                  </span>
                                  <span className="flex items-center gap-1 pl-6 font-mono text-[10px] text-muted-foreground sm:pl-0">
                                    <span className="max-w-[140px] truncate" title={opt.id}>
                                      {opt.id}
                                    </span>
                                    <CopyIdButton id={opt.id} noun="Option" />
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : typeNorm === "number" ? (
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g. 2.5"
                          value={value.valueText ?? ""}
                          onChange={(e) =>
                            setAttributeValue(attr.id, {
                              valueText: e.target.value || null,
                            })
                          }
                        />
                      ) : (
                        <Input
                          placeholder="e.g. value"
                          value={value.valueText ?? ""}
                          onChange={(e) =>
                            setAttributeValue(attr.id, {
                              valueText: e.target.value || null,
                            })
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Images (upload to Cloudinary)</Label>
            <div className="flex flex-wrap gap-3 items-start">
              {images.map((url) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt=""
                    className="h-24 w-24 rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/50">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage ? "Uploading…" : "+ Add"}
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : product ? "Update" : "Create"} Product
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
