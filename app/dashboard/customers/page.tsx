import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomersTable } from "./customers-table";
import { UserPlus } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage users</p>
        </div>
        <Link href="/dashboard/users/create">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Create user
          </Button>
        </Link>
      </div>
      <CustomersTable />
    </div>
  );
}
