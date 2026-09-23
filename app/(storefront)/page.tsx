import {
  getBestSellingProducts,
  getDiscountedProducts,
  getPromoProducts,
  getSiteSettings,
  getStorefrontBrands,
  getStorefrontCategories,
  getStorefrontProducts,
} from "@/lib/storefront";
import { HOME_VARIANTS, type HomeData } from "@/components/storefront/home/home-variants";

export default async function HomePage() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getStorefrontCategories()]);
  const variant = (settings.homeVariant ?? "1") in HOME_VARIANTS ? settings.homeVariant ?? "1" : "1";
  const Home = HOME_VARIANTS[variant as keyof typeof HOME_VARIANTS];

  // Only the boutique layout needs a product row per category
  const rowCategories =
    variant === "5" ? categories.filter((c) => c._count.products > 0).slice(0, 4) : [];

  const [newest, bestSellers, promos, deals, brands, rowProducts] = await Promise.all([
    getStorefrontProducts({ sort: "newest", limit: variant === "4" ? 10 : 8 }),
    getBestSellingProducts(8),
    getPromoProducts(2),
    getDiscountedProducts(8),
    getStorefrontBrands(),
    Promise.all(
      rowCategories.map((c) => getStorefrontProducts({ category: c.slug, sort: "newest", limit: 8 }))
    ),
  ]);

  const data: HomeData = {
    siteTitle: settings.siteTitle ?? "E-commerce",
    banners: Array.isArray(settings.bannerUrls) ? (settings.bannerUrls as string[]) : [],
    categories,
    newest: newest.data,
    bestSellers,
    promos,
    deals,
    brands,
    categoryRows: rowCategories.map((category, i) => ({ category, products: rowProducts[i].data })),
  };

  return <Home {...data} />;
}
