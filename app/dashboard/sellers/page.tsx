import { SellersTable } from "./sellers-table";

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sellers</h1>
        <p className="text-muted-foreground mt-1">Manage sellers and their products</p>
      </div>
      <SellersTable />
    </div>
  );
}
