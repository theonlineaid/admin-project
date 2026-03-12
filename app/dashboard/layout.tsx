import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayoutProvider } from "@/components/dashboard/dashboard-layout-context";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;

  return (
    <DashboardLayoutProvider role={role}>
      <DashboardShell role={role}>{children}</DashboardShell>
    </DashboardLayoutProvider>
  );
}
