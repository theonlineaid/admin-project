"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

type User = { id: string; name: string; email: string; role: string };
type Product = { id: string; name: string; price: string; stock: number };

export function InvoiceForm() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: "", quantity: 1 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users?limit=500")
      .then((r) => r.json())
      .then((d) => setUsers(d.data || []))
      .catch(console.error);
    fetch("/api/products?limit=500&status=active")
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []))
      .catch(console.error);
  }, []);

  function addRow() {
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: "productId" | "quantity", value: string | number) {
    setItems((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: field === "quantity" ? Number(value) || 1 : value } : row
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      alert("Please select a customer.");
      return;
    }
    const validItems = items.filter((i) => i.productId && i.quantity >= 1);
    if (validItems.length === 0) {
      alert("Add at least one product with quantity.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        items: validItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        notes: notes || undefined,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to create invoice");
      return;
    }
    const order = await res.json();
    router.push(`/dashboard/orders/${order.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={userId} onChange={(e) => setUserId(e.target.value)} required>
              <option value="">Select customer</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) {u.role !== "customer" ? ` – ${u.role}` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-1" />
                Add line
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    value={row.productId}
                    onChange={(e) => updateRow(index, "productId", e.target.value)}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} – ${Number(p.price).toFixed(2)}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    className="w-24"
                    value={row.quantity}
                    onChange={(e) => updateRow(index, "quantity", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(index)}
                    disabled={items.length <= 1}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Order notes..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create invoice"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
