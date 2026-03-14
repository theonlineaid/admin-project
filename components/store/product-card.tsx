import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  images: string[];
  category?: { name: string };
  brand?: { name: string } | null;
};

export function ProductCard({ product }: { product: Product }) {
  const price = parseFloat(product.price.toString());
  const compareAt = product.compareAtPrice
    ? parseFloat(product.compareAtPrice.toString())
    : null;
  const imageUrl = product.images?.[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {compareAt != null && compareAt > price && (
          <span className="absolute top-2 left-2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            Sale
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        {product.brand?.name && (
          <p className="text-xs text-muted-foreground mb-0.5">{product.brand.name}</p>
        )}
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-primary">
            ${price.toFixed(2)}
          </span>
          {compareAt != null && compareAt > price && (
            <span className="text-sm text-muted-foreground line-through">
              ${compareAt.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
