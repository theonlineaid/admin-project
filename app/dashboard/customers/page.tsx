import { CustomersTable } from "./customers-table";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-600 mt-1">View and manage customers</p>
      </div>
      <CustomersTable />
    </div>
  );
}
