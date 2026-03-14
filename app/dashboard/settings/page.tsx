import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteSettingsForm } from "./site-settings-form";

export default async function SiteSettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
        <p className="text-muted-foreground mt-1">
          Logo, favicon, site title, header & footer layout, and top bar
        </p>
      </div>
      <SiteSettingsForm />
    </div>
  );
}
