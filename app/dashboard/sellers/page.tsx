import { SellersTable } from "./sellers-table";

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sellers</h1>
        <p className="text-slate-600 mt-1">Manage sellers and their products</p>
      </div>
      <SellersTable />
    </div>
  );
}
