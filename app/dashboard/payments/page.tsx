import { PaymentsTable } from "./payments-table";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-600 mt-1">View payment history</p>
      </div>
      <PaymentsTable />
    </div>
  );
}
