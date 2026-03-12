"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BlockUserButton({ userId, blocked }: { userId: string; blocked: boolean }) {
  const router = useRouter();

  async function handleToggle() {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !blocked }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <Button variant={blocked ? "default" : "destructive"} size="sm" onClick={handleToggle}>
      {blocked ? "Unblock" : "Block"}
    </Button>
  );
}
