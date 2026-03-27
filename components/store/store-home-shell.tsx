import Link from "next/link";
import { HomeProductsSection } from "@/components/store/home-products-section";
import { StoreHeader } from "@/components/store/header";
import type { StoreHomePageData } from "@/lib/store-home-data";
import { cn } from "@/lib/utils";

type Props = {
  data: StoreHomePageData;
  /** `default` — title + search in one row. `index1` — centered hero + full-width search (store showcase layout). */
  layout?: "default" | "index1";
};

export function StoreHomeShell({ data, layout = "default" }: Props) {
  const {
    siteTitle,
    logoUrl,
    headerVariant,
    initialProducts,
    categories,
    initialCategoryId,
    initialSearchQuery,
    filtersKey,
    initialTotal,
    initialTotalPages,
  } = data;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader
        variant={headerVariant}
        siteTitle={siteTitle}
        logoUrl={logoUrl}
        categories={categories}
      />

      {/* {bannerUrls.length > 0 && (
        <div className="w-full shrink-0">
          <BannerCarousel urls={bannerUrls} />
        </div>
      )} */}

      <main className="flex-1">
        <section
          className={cn(
            "container mx-auto px-4 py-8 sm:py-12",
            layout === "index1" && "max-w-6xl"
          )}
        >
          {layout === "index1" && (
            <nav className="mb-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground hover:underline">
                Home
              </Link>
              <span className="mx-2 text-border">/</span>
              <span className="text-foreground">Store</span>
            </nav>
          )}
          {layout === "index1" ? (
            <div className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-8 lg:p-10">
              <HomeProductsSection
                key={filtersKey}
                variant="index1"
                initialProducts={initialProducts}
                categories={categories}
                initialCategoryId={initialCategoryId}
                initialSearchQuery={initialSearchQuery}
                initialTotal={initialTotal}
                initialTotalPages={initialTotalPages}
              />
            </div>
          ) : (
            <HomeProductsSection
              key={filtersKey}
              variant="default"
              initialProducts={initialProducts}
              categories={categories}
              initialCategoryId={initialCategoryId}
              initialSearchQuery={initialSearchQuery}
              initialTotal={initialTotal}
              initialTotalPages={initialTotalPages}
            />
          )}
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteTitle}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
