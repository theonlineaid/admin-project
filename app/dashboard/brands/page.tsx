import { BrandsTable } from "./brands-table";

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Brands</h1>
        <p className="text-muted-foreground mt-1">Manage brands</p>
      </div>
      <BrandsTable />
    </div>
  );
}
