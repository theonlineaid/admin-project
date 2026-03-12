import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { HeaderDrawer } from "@/components/dashboard/header-drawer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar role={role} />
      <HeaderDrawer />
      <main className="pl-64 pt-16">
        <div className="min-h-screen p-6">{children}</div>
      </main>
    </div>
  );
}
