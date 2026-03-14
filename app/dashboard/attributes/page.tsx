import { AttributesTable } from "./attributes-table";

export default function AttributesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attributes</h1>
        <p className="text-muted-foreground mt-1">
          Manage product attributes (e.g. Clothing Size, Sneaker Size, Weight). Add them to products in the product form.
        </p>
      </div>
      <AttributesTable />
    </div>
  );
}
