"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export function OrderStatusUpdate({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const res = await fetch("/api/orders/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex gap-2 items-center">
      <Select value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>
      <Button size="sm" onClick={handleUpdate} disabled={loading}>
        Update
      </Button>
    </div>
  );
}
