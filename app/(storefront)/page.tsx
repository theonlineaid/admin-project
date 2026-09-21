import {
  getSiteSettings,
  getStorefrontCategories,
  getStorefrontProducts,
} from "@/lib/storefront";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { CategorySection } from "@/components/storefront/category-nav";
import { ProductGrid } from "@/components/storefront/product-grid";
import Link from "next/link";

export default async function HomePage() {
  const [settings, categories, newest] = await Promise.all([
    getSiteSettings(),
    getStorefrontCategories(),
    getStorefrontProducts({ sort: "newest", limit: 10 }),
  ]);

  const banners = Array.isArray(settings.bannerUrls)
    ? (settings.bannerUrls as string[])
    : [];

  return (
    <div className="space-y-12">
      <HeroBanner banners={banners} />

      <CategorySection categories={categories} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            New arrivals
          </h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          <ProductGrid products={newest.data} />
        </div>
      </section>
    </div>
  );
}
