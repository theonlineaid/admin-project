import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: "active" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true } },
    },
  });

  if (!product) notFound();

  const price = parseFloat(product.price.toString());
  const compareAt = product.compareAtPrice
    ? parseFloat(product.compareAtPrice.toString())
    : null;
  const imageUrl = product.images?.[0] ?? null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="font-semibold text-foreground hover:text-primary">
            ← Back to store
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <div>
            {product.brand?.name && (
              <p className="text-sm text-muted-foreground">{product.brand.name}</p>
            )}
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xl font-semibold text-primary">
                ${price.toFixed(2)}
              </span>
              {compareAt != null && compareAt > price && (
                <span className="text-muted-foreground line-through">
                  ${compareAt.toFixed(2)}
                </span>
              )}
            </div>
            {product.description && (
              <div className="mt-6 text-muted-foreground">
                <h2 className="text-sm font-medium text-foreground">Description</h2>
                <p className="mt-2 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
