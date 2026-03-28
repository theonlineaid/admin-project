import { prisma } from "@/lib/prisma";
import { listFolderResources } from "@/lib/cloudinary";
import {
  fetchStorefrontProducts,
  serializeStorefrontProductForJson,
  storefrontProductInclude,
} from "@/lib/storefront-products";

export type StoreHomeCategory = {
  id: string;
  name: string;
  slug: string;
};

/** Plain JSON-safe product slice for client components (no Prisma Decimal). */
export type StoreHomeProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  images: string[];
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string } | null;
};

export type StoreHomePageData = {
  bannerUrls: string[];
  siteTitle: string;
  logoUrl: string | null;
  headerVariant: string;
  initialProducts: StoreHomeProduct[];
  categories: StoreHomeCategory[];
  initialCategoryId: string;
  /** Search text to sync with header URL (`?search=`) */
  initialSearchQuery: string;
  /** Remount product section when URL-driven filters change (client pagination keeps same key). */
  filtersKey: string;
  initialTotal: number;
  initialTotalPages: number;
};

export type StoreHomeFilters = {
  search?: string;
  categorySlug?: string;
};

/** Shared data for storefront home (`/`) and alternate layouts (e.g. `/store/index1`). */
export async function getStoreHomePageData(filters?: StoreHomeFilters): Promise<StoreHomePageData> {
  const bannerFolderImages = await listFolderResources("banner/");
  const bannerUrlsFromFolder = bannerFolderImages.map((img) => img.secureUrl);

  const [settings, categories] = await Promise.all([
    prisma.siteSettings.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rawBanner = settings?.bannerUrls;
  const bannerUrlsFromSettings: string[] =
    Array.isArray(rawBanner) && rawBanner.length >= 1 ? (rawBanner as string[]) : [];
  const bannerUrls: string[] =
    bannerUrlsFromFolder.length > 0 ? bannerUrlsFromFolder : bannerUrlsFromSettings;

  const siteTitle = settings?.siteTitle ?? "Store";
  const logoUrl = settings?.logoUrl ?? null;
  const headerVariant = settings?.headerVariant ?? "1";

  const search = filters?.search?.trim();
  const categorySlug = filters?.categorySlug?.trim();

  if (search || categorySlug) {
    const { rows, total } = await fetchStorefrontProducts({
      page: 1,
      limit: 12,
      search,
      categorySlug,
    });

    let initialCategoryId = "";
    if (categorySlug) {
      const c = categories.find((x) => x.slug === categorySlug);
      if (c) initialCategoryId = c.id;
    }

    const initialTotalPages = Math.max(1, Math.ceil(total / 12));
    const filtersKey = `q:${search ?? ""}|c:${categorySlug ?? ""}`;

    return {
      bannerUrls,
      siteTitle,
      logoUrl,
      headerVariant,
      initialProducts: rows.map(serializeStorefrontProductForJson),
      categories,
      initialCategoryId,
      initialSearchQuery: search ?? "",
      filtersKey,
      initialTotal: total,
      initialTotalPages,
    };
  }

  const womenCategory = await prisma.category.findUnique({
    where: { slug: "women" },
    select: { id: true },
  });

  const allProducts = await prisma.product.findMany({
    where: { status: "active" },
    take: 12,
    orderBy: { createdAt: "desc" },
    include: storefrontProductInclude,
  });

  let productsToShow = allProducts;
  let initialCategoryId = "";
  const countWhere: { status: "active"; categoryId?: string } = { status: "active" };

  if (womenCategory) {
    const womenProducts = await prisma.product.findMany({
      where: { status: "active", categoryId: womenCategory.id },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: storefrontProductInclude,
    });
    if (womenProducts.length > 0) {
      productsToShow = womenProducts;
      initialCategoryId = womenCategory.id;
      countWhere.categoryId = womenCategory.id;
    }
  }

  const initialTotal = await prisma.product.count({ where: countWhere });
  const initialTotalPages = Math.max(1, Math.ceil(initialTotal / 12));

  return {
    bannerUrls,
    siteTitle,
    logoUrl,
    headerVariant,
    initialProducts: productsToShow.map(serializeStorefrontProductForJson),
    categories,
    initialCategoryId,
    initialSearchQuery: "",
    filtersKey: "home-default",
    initialTotal,
    initialTotalPages,
  };
}
