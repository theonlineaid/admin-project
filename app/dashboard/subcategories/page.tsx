import { SubcategoriesTable } from "./subcategories-table";

export default function SubcategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subcategories</h1>
        <p className="text-slate-600 mt-1">Manage subcategories under categories</p>
      </div>
      <SubcategoriesTable />
    </div>
  );
}
