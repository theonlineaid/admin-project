"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  };
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);

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

  const filteredSubcategories = subcategories.filter((s) => s.categoryId === categoryId);

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      compareAtPrice: values.compareAtPrice || undefined,
      subcategoryId: values.subcategoryId || undefined,
      brandId: values.brandId || undefined,
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
