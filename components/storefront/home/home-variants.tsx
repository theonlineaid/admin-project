import Link from "next/link";
import type { StorefrontCategory, StorefrontProductCard } from "@/lib/storefront";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { ProductGrid } from "@/components/storefront/product-grid";
import { CategoryCarousel } from "@/components/storefront/home/category-carousel";
import { PromoCard } from "@/components/storefront/home/promo-card";
import { SectionHeading } from "@/components/storefront/home/section-heading";
import {
  BrandStrip,
  CategoryPills,
  CategorySidebar,
  CategoryTiles,
  DarkButton,
  ProductRail,
  withStock,
  type StorefrontBrand,
} from "@/components/storefront/home/home-blocks";

export type HomeData = {
  siteTitle: string;
  banners: string[];
  categories: StorefrontCategory[];
  newest: StorefrontProductCard[];
  bestSellers: StorefrontProductCard[];
  promos: StorefrontProductCard[];
  deals: StorefrontProductCard[];
  brands: StorefrontBrand[];
  categoryRows: { category: StorefrontCategory; products: StorefrontProductCard[] }[];
};

const BEST_SELLING_SUBTITLE =
  "These top picks are flying off the shelves. Find out what everyone's loving right now.";

/** 1 — Showcase: slider with offer cards, round category icons, arrivals, best sellers. */
export function HomeV1({ banners, categories, newest, bestSellers, promos }: HomeData) {
  return (
    <div className="space-y-14 pb-6">
      <section className="-mx-4 bg-muted/60 px-4 py-6 sm:-mx-6 sm:rounded-3xl sm:px-6 sm:py-8">
        <div className={promos.length ? "grid gap-4 lg:grid-cols-3" : undefined}>
          <div className="lg:col-span-2">
            <HeroBanner banners={banners} />
          </div>
          {promos.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
              {promos.map((product) => (
                <PromoCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <CategoryCarousel categories={categories} />

      <section className="space-y-6">
        <SectionHeading title="New Arrivals" href="/products" />
        <ProductGrid products={newest} />
      </section>

      {bestSellers.length ? (
        <section className="space-y-8 rounded-3xl bg-muted/60 px-4 py-10 sm:px-8">
          <SectionHeading centered title="Best Selling Products" subtitle={BEST_SELLING_SUBTITLE} />
          <ProductGrid products={bestSellers} />
          <div className="flex justify-center">
            <DarkButton href="/products">View All Products</DarkButton>
          </div>
        </section>
      ) : null}
    </div>
  );
}

/** 2 — Bold banner: wide cinematic slider, category cards, deals, arrivals, brands. */
export function HomeV2({ banners, categories, newest, deals, brands }: HomeData) {
  return (
    <div className="space-y-14 pb-6">
      <HeroBanner banners={banners} className="sm:aspect-[21/9] lg:aspect-[3/1]" />

      {withStock(categories).length ? (
        <section className="space-y-6">
          <SectionHeading title="Shop by Category" href="/products" />
          <CategoryTiles categories={categories} />
        </section>
      ) : null}

      {deals.length ? (
        <section className="space-y-6 rounded-3xl bg-primary/5 px-4 py-8 sm:px-8">
          <SectionHeading title="Today's Deals" subtitle="Biggest price drops right now" href="/products" />
          <ProductGrid products={deals.slice(0, 4)} />
        </section>
      ) : null}

      <section className="space-y-6">
        <SectionHeading title="New Arrivals" href="/products" />
        <ProductGrid products={newest} />
      </section>

      {brands.length ? (
        <section className="space-y-6 border-t border-border pt-12">
          <SectionHeading centered title="Shop by Brand" />
          <BrandStrip brands={brands} />
        </section>
      ) : null}
    </div>
  );
}

/** 3 — Minimal editorial: big type, category chips, three wide columns. */
export function HomeV3({ siteTitle, banners, categories, newest, bestSellers }: HomeData) {
  return (
    <div className="space-y-16 pb-6">
      <section className="mx-auto max-w-3xl pt-8 text-center sm:pt-14">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {siteTitle}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
          Good things, thoughtfully chosen.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          A curated selection across every category. Fewer choices, better ones.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <DarkButton href="/products">Shop the collection</DarkButton>
          <Link
            href="#categories"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-muted"
          >
            Browse categories
          </Link>
        </div>
      </section>

      {banners.length ? <HeroBanner banners={banners} className="sm:aspect-[21/9]" /> : null}

      <section id="categories" className="scroll-mt-24">
        <CategoryPills categories={categories} />
      </section>

      <section className="space-y-8">
        <SectionHeading centered title="Just In" />
        <ProductGrid products={newest.slice(0, 6)} columns={3} />
      </section>

      {bestSellers.length ? (
        <section className="space-y-8 border-t border-border pt-14">
          <SectionHeading centered title="Most Loved" subtitle={BEST_SELLING_SUBTITLE} />
          <ProductGrid products={bestSellers.slice(0, 6)} columns={3} />
        </section>
      ) : null}
    </div>
  );
}

/** 4 — Marketplace: category sidebar beside the slider, scrolling product rails, dense grid. */
export function HomeV4({ banners, categories, newest, bestSellers, deals }: HomeData) {
  const hasSidebar = withStock(categories).length > 0;
  return (
    <div className="space-y-12 pb-6">
      <section className={hasSidebar ? "grid gap-4 lg:grid-cols-4" : undefined}>
        {hasSidebar ? <CategorySidebar categories={categories} className="hidden lg:block" /> : null}
        <div className="lg:col-span-3">
          <HeroBanner banners={banners} className="lg:aspect-auto lg:h-full lg:min-h-[20rem]" />
        </div>
      </section>

      {/* The sidebar is desktop-only; phones get the round icons instead */}
      <div className="lg:hidden">
        <CategoryCarousel categories={categories} />
      </div>

      {deals.length ? (
        <section className="space-y-5">
          <SectionHeading title="Flash Deals" href="/products" />
          <ProductRail products={deals} />
        </section>
      ) : null}

      {bestSellers.length ? (
        <section className="space-y-5">
          <SectionHeading title="Best Sellers" href="/products" />
          <ProductRail products={bestSellers} />
        </section>
      ) : null}

      <section className="space-y-6">
        <SectionHeading title="More to Explore" href="/products" />
        <ProductGrid products={newest} columns={5} />
      </section>
    </div>
  );
}

/** 5 — Boutique: split hero, then one product row per category, brands. */
export function HomeV5({ banners, categories, promos, categoryRows, newest, brands }: HomeData) {
  const firstCategory = withStock(categories)[0];
  // A row with one or two products looks empty; show those categories through "New Arrivals" instead
  const rows = categoryRows.filter((row) => row.products.length >= 3);
  return (
    <div className="space-y-14 pb-6">
      <section className="grid gap-4 lg:grid-cols-5">
        <div
          className={`flex flex-col justify-center rounded-2xl bg-foreground p-8 text-background sm:p-10 ${
            banners.length ? "lg:col-span-2" : "lg:col-span-5 lg:min-h-[20rem]"
          }`}
        >
          <p className="text-sm font-medium uppercase tracking-wide text-background/60">New collection</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Find something you&apos;ll keep for years.
          </h1>
          <p className="mt-3 text-sm text-background/70">
            Hand-picked products from independent sellers, shipped to your door.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center rounded-md bg-background px-6 text-sm font-medium text-foreground hover:bg-background/90"
            >
              Shop now
            </Link>
            {firstCategory ? (
              <Link
                href={`/products?category=${firstCategory.slug}`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-background/30 px-6 text-sm font-medium text-background hover:bg-background/10"
              >
                {firstCategory.name}
              </Link>
            ) : null}
          </div>
        </div>
        {banners.length ? (
          <div className="lg:col-span-3">
            <HeroBanner banners={banners} className="lg:aspect-auto lg:h-full lg:min-h-[22rem]" />
          </div>
        ) : null}
      </section>

      {promos.length ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {promos.map((product) => (
            <div key={product.id} className="rounded-2xl border border-border">
              <PromoCard product={product} />
            </div>
          ))}
        </section>
      ) : null}

      {rows.length === 0 ? (
        <section className="space-y-6">
          <SectionHeading title="New Arrivals" href="/products" />
          <ProductGrid products={newest} />
        </section>
      ) : null}

      {rows.map(({ category, products }) => (
        <section key={category.id} className="space-y-5">
          <SectionHeading
            title={category.name}
            subtitle={`${category._count.products} ${category._count.products === 1 ? "product" : "products"}`}
            href={`/products?category=${category.slug}`}
          />
          <ProductRail products={products} />
        </section>
      ))}

      {brands.length ? (
        <section className="space-y-6 rounded-3xl bg-muted/60 px-4 py-10 sm:px-8">
          <SectionHeading centered title="Our Brands" />
          <BrandStrip brands={brands} />
        </section>
      ) : null}
    </div>
  );
}

export const HOME_VARIANTS = {
  "1": HomeV1,
  "2": HomeV2,
  "3": HomeV3,
  "4": HomeV4,
  "5": HomeV5,
} as const;
