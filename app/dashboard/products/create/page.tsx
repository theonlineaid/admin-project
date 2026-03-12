import { ProductForm } from "../product-form";

export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Product</h1>
        <p className="text-slate-600 mt-1">Create a new product</p>
      </div>
      <ProductForm />
    </div>
  );
}
