import { PaymentsTable } from "./payments-table";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground mt-1">View payment history</p>
      </div>
      <PaymentsTable />
    </div>
  );
}
