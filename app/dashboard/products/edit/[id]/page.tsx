import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) notFound();
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true, subcategory: true },
  });
  if (!product) notFound();
  const role = (session.user as { role?: string }).role;
  const userId = (session.user as { id?: string }).id;
  if (role === "seller" && product.sellerId !== userId) notFound();
  const serialized = {
    ...product,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="text-slate-600 mt-1">{serialized.name}</p>
      </div>
      <ProductForm product={serialized} />
    </div>
  );
}
