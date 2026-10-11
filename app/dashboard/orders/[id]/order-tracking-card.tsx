"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Check, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const CARRIERS = ["FedEx", "DHL Express", "UPS", "USPS", "Royal Mail", "BlueDart", "Courier Service"];
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export function OrderTrackingCard({
  orderId,
  currentCarrier,
  currentTrackingNumber,
  currentStatus,
  timeline,
}: {
  orderId: string;
  currentCarrier?: string | null;
  currentTrackingNumber?: string | null;
  currentStatus: string;
  timeline?: any[] | null;
}) {
  const router = useRouter();
  const [carrier, setCarrier] = useState(currentCarrier ?? "FedEx");
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? "");
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const history = Array.isArray(timeline) ? timeline : [];

  async function handleSaveTracking(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier,
          trackingNumber: trackingNumber.trim() || undefined,
          status,
          note: note.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Order fulfillment & tracking updated!");
        setNote("");
        router.refresh();
      } else {
        toast.error("Failed to update tracking");
      }
    } catch {
      toast.error("Error saving tracking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg text-foreground">Fulfillment & Carrier Tracking</h2>
      </div>

      <form onSubmit={handleSaveTracking} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="carrier-select">Carrier</Label>
          <select
            id="carrier-select"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            {CARRIERS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="tracking-num">Tracking Number</Label>
          <Input
            id="tracking-num"
            placeholder="e.g. 78912345678"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="status-select">Order Status</Label>
          <select
            id="status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button type="submit" disabled={loading} className="w-full font-medium">
            {loading ? "Updating…" : "Update Tracking"}
          </Button>
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <Label htmlFor="tracking-note">Status Note (Optional - visible in customer log)</Label>
          <Input
            id="tracking-note"
            placeholder="e.g. Package dispatched from distribution hub"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 text-xs"
          />
        </div>
      </form>

      {history.length > 0 && (
        <div className="border-t border-border pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Tracking Activity History
          </h3>
          <div className="space-y-2">
            {history.map((ev, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                <span className="font-semibold text-foreground capitalize flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {ev.status} {ev.note ? `— ${ev.note}` : ""}
                </span>
                <span className="text-muted-foreground">{formatDate(ev.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

