import { CategoriesTable } from "./categories-table";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-1">Manage product categories</p>
      </div>
      <CategoriesTable />
    </div>
  );
}
