import {
  getStorefrontProducts,
  getStorefrontCategories,
  getStorefrontBrands,
} from "@/lib/storefront";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ProductFilters, SortSelect } from "@/components/storefront/product-filters";
import { StorefrontPagination } from "@/components/storefront/pagination";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const [result, categories, brands] = await Promise.all([
    getStorefrontProducts({
      q: sp.q,
      category: sp.category,
      subcategory: sp.subcategory,
      brand: sp.brand,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      sort: sp.sort,
      page,
    }),
    getStorefrontCategories(),
    getStorefrontBrands(),
  ]);

  const categoryFacets = categories
    .filter((c) => c._count.products > 0)
    .map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }));
  const brandFacets = brands.map((b) => ({
    slug: b.slug,
    name: b.name,
    count: b._count.products,
  }));

  const activeCategory = categories.find((c) => c.slug === sp.category);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <ProductFilters categories={categoryFacets} brands={brandFacets} />
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">
              {sp.q
                ? `Results for "${sp.q}"`
                : activeCategory
                ? activeCategory.name
                : "All products"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {result.total} product{result.total === 1 ? "" : "s"}
            </p>
          </div>
          <SortSelect />
        </div>

        <div className="mt-6">
          <ProductGrid products={result.data} />
        </div>

        <div className="mt-6">
          <StorefrontPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            limit={result.limit}
          />
        </div>
      </div>
    </div>
  );
}
