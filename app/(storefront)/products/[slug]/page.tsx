import { notFound } from "next/navigation";
import Link from "next/link";
import { getStorefrontProduct } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { ProductGrid } from "@/components/storefront/product-grid";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getStorefrontProduct(slug);
  if (!result) notFound();

  const { product, related } = result;
  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null;

  return (
    <div className="space-y-12">
      <nav className="text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          All products
        </Link>
        {product.category ? (
          <>
            {" "}
            /{" "}
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.brand ? (
            <p className="text-sm text-muted-foreground">{product.brand.name}</p>
          ) : null}
          <h1 className="font-display mt-1 text-2xl font-semibold text-foreground">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-foreground">
              {formatCurrency(price)}
            </span>
            {compareAt && compareAt > price ? (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(compareAt)}
                </span>
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-sm font-semibold text-rose-700">
                  -{discount}%
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {product.stock > 0
              ? product.stock <= 5
                ? `Only ${product.stock} left in stock`
                : "In stock"
              : "Out of stock"}
          </p>

          <div className="mt-6">
            <ProductPurchasePanel
              product={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price,
                image: product.images[0] ?? null,
                stock: product.stock,
              }}
            />
          </div>

          {product.description ? (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-foreground">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-muted-foreground">
            Sold by {product.seller.name}
          </p>
        </div>
      </div>

      {related.length > 0 ? (
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">
            You may also like
          </h2>
          <div className="mt-4">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
