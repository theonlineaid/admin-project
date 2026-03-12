import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductsTable } from "./products-table";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Link href="/dashboard/products/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>
      <ProductsTable />
    </div>
  );
}
