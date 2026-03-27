import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { listFolderResources } from "@/lib/cloudinary";

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

type ProductRowDb = {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  images: string[];
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string } | null;
};

function serializeStoreProduct(p: ProductRowDb): StoreHomeProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price.toString(),
    compareAtPrice: p.compareAtPrice != null ? p.compareAtPrice.toString() : null,
    images: [...p.images],
    category: { ...p.category },
    brand: p.brand ? { ...p.brand } : null,
  };
}

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true } },
} as const;

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
    const where: Prisma.ProductWhereInput = { status: "active" };
    if (categorySlug) {
      const cat = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (cat) where.categoryId = cat.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [productsToShow, initialTotal] = await Promise.all([
      prisma.product.findMany({
        where,
        take: 12,
        skip: 0,
        orderBy: { createdAt: "desc" },
        include: productInclude,
      }),
      prisma.product.count({ where }),
    ]);

    let initialCategoryId = "";
    if (categorySlug) {
      const c = categories.find((x) => x.slug === categorySlug);
      if (c) initialCategoryId = c.id;
    }

    const initialTotalPages = Math.max(1, Math.ceil(initialTotal / 12));
    const filtersKey = `q:${search ?? ""}|c:${categorySlug ?? ""}`;

    return {
      bannerUrls,
      siteTitle,
      logoUrl,
      headerVariant,
      initialProducts: productsToShow.map(serializeStoreProduct),
      categories,
      initialCategoryId,
      initialSearchQuery: search ?? "",
      filtersKey,
      initialTotal,
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
    include: productInclude,
  });

  let productsToShow: ProductRowDb[] = allProducts;
  let initialCategoryId = "";
  const countWhere: { status: "active"; categoryId?: string } = { status: "active" };

  if (womenCategory) {
    const womenProducts = await prisma.product.findMany({
      where: { status: "active", categoryId: womenCategory.id },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: productInclude,
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
    initialProducts: productsToShow.map(serializeStoreProduct),
    categories,
    initialCategoryId,
    initialSearchQuery: "",
    filtersKey: "home-default",
    initialTotal,
    initialTotalPages,
  };
}
