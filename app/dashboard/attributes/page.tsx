import { AttributesTable } from "./attributes-table";

export default function AttributesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attributes</h1>
        <p className="text-muted-foreground mt-1">
          Create one attribute per kind of choice: e.g. &quot;Size&quot; with key <code className="rounded bg-muted px-1 text-xs">clothing-size</code> for shirts, and another &quot;EU shoe size&quot; with key{" "}
          <code className="rounded bg-muted px-1 text-xs">eu-shoe-size</code> for sneakers. You do not need color if you only sell sizes. On each product, pick only the values that apply.
        </p>
      </div>
      <AttributesTable />
    </div>
  );
}
