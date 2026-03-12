import { BrandsTable } from "./brands-table";

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Brands</h1>
        <p className="text-slate-600 mt-1">Manage brands</p>
      </div>
      <BrandsTable />
    </div>
  );
}
