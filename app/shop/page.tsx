import Link from "next/link";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  fetchStorefrontProducts,
  serializeStorefrontProductForJson,
} from "@/lib/storefront-products";
import type { StorefrontSort } from "@/lib/storefront-products";
import { shopHref } from "@/lib/shop-url";
import { getShopGridColumnsForViewer } from "@/lib/store-shop-user-settings";
import { ProductCard } from "@/components/store/product-card";
import { ShopGridColumnPicker } from "@/components/store/shop-grid-column-picker";
import { ShopSortSelect } from "@/components/store/shop-sort-select";
import { StoreHeader } from "@/components/store/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Shop | Store",
  description: "Browse products, filter by category and brand.",
};

function pick(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const search = pick(sp.search)?.trim();
  const categorySlug = pick(sp.categorySlug)?.trim();
  const brand = pick(sp.brand)?.trim();
  const sortRaw = pick(sp.sort)?.trim();
  const sort: StorefrontSort =
    sortRaw === "price_asc" || sortRaw === "price_desc" ? sortRaw : "newest";
  const pageRaw = parseInt(pick(sp.page) ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const [settings, categories, brands, productResult, shopGridColumns] =
    await Promise.all([
    prisma.siteSettings.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { products: { some: { status: "active" } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    fetchStorefrontProducts({
      page,
      limit: 12,
      search,
      categorySlug,
      brandSlug: brand,
      sort,
    }),
    getShopGridColumnsForViewer(),
  ]);

  const { rows, total, limit } = productResult;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const products = rows.map(serializeStorefrontProductForJson);

  const siteTitle = settings?.siteTitle ?? "Store";
  const logoUrl = settings?.logoUrl ?? null;
  const headerVariant = settings?.headerVariant ?? "1";
  const shopGridStyle = {
    "--shop-cols": String(shopGridColumns),
  } as CSSProperties;

  const filterBase = {
    search: search ?? null,
    brand: brand ?? null,
    sort: sort === "newest" ? null : sort,
    page: null as number | null,
  };

  const pageLink = (p: number) =>
    shopHref({
      search: search ?? null,
      categorySlug: categorySlug ?? null,
      brand: brand ?? null,
      sort: sort === "newest" ? null : sort,
      page: p > 1 ? p : null,
    });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader
        variant={headerVariant}
        siteTitle={siteTitle}
        logoUrl={logoUrl}
        categories={categories}
      />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <nav className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Shop</span>
          </nav>

          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Shop</h1>
          <p className="mt-1 text-muted-foreground">
            {search ? (
              <>
                Results for &ldquo;{search}&rdquo; · {total} product
                {total !== 1 ? "s" : ""}
              </>
            ) : (
              <>
                {total} product{total !== 1 ? "s" : ""}
              </>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row">
            <aside className="w-full shrink-0 space-y-6 lg:w-56">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Category</h2>
                <ul className="mt-2 space-y-1">
                  <li>
                    <Link
                      href={shopHref({ ...filterBase, categorySlug: null })}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                        !categorySlug
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      All categories
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={shopHref({
                          ...filterBase,
                          categorySlug: c.slug,
                        })}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                          categorySlug === c.slug
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-foreground">Brand</h2>
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
                  <li>
                    <Link
                      href={shopHref({
                        ...filterBase,
                        categorySlug: categorySlug ?? null,
                        brand: null,
                      })}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                        !brand
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      All brands
                    </Link>
                  </li>
                  {brands.map((b) => (
                    <li key={b.id}>
                      <Link
                        href={shopHref({
                          ...filterBase,
                          categorySlug: categorySlug ?? null,
                          brand: b.slug,
                        })}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                          brand === b.slug
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-foreground">Sort</h2>
                <Suspense
                  fallback={
                    <div className="mt-1 h-10 rounded-md bg-muted/50" aria-hidden />
                  }
                >
                  <ShopSortSelect />
                </Suspense>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              {products.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                  No products match your filters. Try adjusting category, brand, or search.
                </p>
              ) : (
                <>
                  <ShopGridColumnPicker value={shopGridColumns} />
                  <div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:[grid-template-columns:repeat(var(--shop-cols),minmax(0,1fr))]"
                    style={shopGridStyle}
                  >
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                      {page > 1 && (
                        <Link
                          href={pageLink(page - 1)}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Previous
                        </Link>
                      )}
                      <span className="px-2 text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                      {page < totalPages && (
                        <Link
                          href={pageLink(page + 1)}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Next
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
