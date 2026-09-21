import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/storefront/sign-out-button";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-xl font-semibold text-foreground">My account</h1>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Name</p>
        <p className="text-card-foreground">{session.user.name}</p>
        <p className="mt-3 text-sm text-muted-foreground">Email</p>
        <p className="text-card-foreground">{session.user.email}</p>
      </div>

      <Link
        href="/orders"
        className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-muted"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <Package className="h-4 w-4" /> My orders
        </span>
        <span className="text-muted-foreground">→</span>
      </Link>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
