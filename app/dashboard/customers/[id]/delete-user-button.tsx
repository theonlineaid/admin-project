"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/customers");
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to delete user");
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="h-4 w-4 mr-1" />
      Delete user
    </Button>
  );
}
