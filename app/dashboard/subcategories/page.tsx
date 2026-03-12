import { SubcategoriesTable } from "./subcategories-table";

export default function SubcategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subcategories</h1>
        <p className="text-muted-foreground mt-1">Manage subcategories under categories</p>
      </div>
      <SubcategoriesTable />
    </div>
  );
}
