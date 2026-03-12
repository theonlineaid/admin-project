import { ProductForm } from "../product-form";

export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
        <p className="text-muted-foreground mt-1">Create a new product</p>
      </div>
      <ProductForm />
    </div>
  );
}
