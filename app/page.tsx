import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listFolderResources } from "@/lib/cloudinary";
import { BannerCarousel } from "@/components/store/banner-carousel";
import { ProductCard } from "@/components/store/product-card";
import { StoreHeader } from "@/components/store/header";

export const metadata = {
  title: "Women's Fashion | Store",
  description: "Discover women's fashion and latest trends.",
};

export default async function StorePage() {
  // 1) Get all banner images first (from Cloudinary banner folder)
  const bannerFolderImages = await listFolderResources("banner/");
  const bannerUrlsFromFolder = bannerFolderImages.map((img) => img.secureUrl);

  const [settings, womenCategory, allProducts] = await Promise.all([
    prisma.siteSettings.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.category.findUnique({
      where: { slug: "women" },
      select: { id: true },
    }),
    prisma.product.findMany({
      where: { status: "active" },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Use all banner folder images if any; otherwise fall back to site settings bannerUrls
  const rawBanner = settings?.bannerUrls;
  const bannerUrlsFromSettings: string[] =
    Array.isArray(rawBanner) && rawBanner.length >= 1 ? (rawBanner as string[]) : [];
  const bannerUrls: string[] =
    bannerUrlsFromFolder.length > 0 ? bannerUrlsFromFolder : bannerUrlsFromSettings;

  const siteTitle = settings?.siteTitle ?? "Store";
  const logoUrl = settings?.logoUrl ?? null;
  const headerVariant = settings?.headerVariant ?? "1";

  let productsToShow = allProducts;
  if (womenCategory) {
    const womenProducts = await prisma.product.findMany({
      where: { status: "active", categoryId: womenCategory.id },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
      },
    });
    if (womenProducts.length > 0) productsToShow = womenProducts;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader
        variant={headerVariant}
        siteTitle={siteTitle}
        logoUrl={logoUrl}
      />

      {bannerUrls.length > 0 && (
        <div className="w-full shrink-0">
          <BannerCarousel urls={bannerUrls} />
        </div>
      )}

      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Women&apos;s Fashion
            </h1>
            <p className="mt-1 text-muted-foreground">
              Discover the latest styles and trends.
            </p>
          </div>

          {productsToShow.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {productsToShow.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    images: product.images,
                    category: product.category,
                    brand: product.brand,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
              <p className="text-muted-foreground">
                No products yet. Add active products in the dashboard, or create a category with slug{" "}
                <strong>women</strong> and assign products to it.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Go to Dashboard
              </Link>
            </div>
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
