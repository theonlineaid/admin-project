import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (settings) return settings;
  return prisma.siteSettings.create({
    data: { siteTitle: "E-commerce", headerVariant: "1", footerVariant: "1", homeVariant: "1" },
  });
}

export async function getStorefrontCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      subcategories: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
      _count: { select: { products: { where: { status: "active" } } } },
    },
  });
}

export type StorefrontCategory = Awaited<
  ReturnType<typeof getStorefrontCategories>
>[number];

export async function getStorefrontBrands() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      logo: true,
      slug: true,
      _count: { select: { products: { where: { status: "active" } } } },
    },
  });
  return brands.filter((b) => b._count.products > 0);
}

const PRODUCT_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  images: true,
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export type StorefrontProductCard = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_CARD_SELECT;
}>;

export type StorefrontProductFilters = {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function getStorefrontProducts(filters: StorefrontProductFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(48, Math.max(1, filters.limit ?? 20));

  const where: Prisma.ProductWhereInput = { status: "active" };
  if (filters.category) where.category = { slug: filters.category };
  if (filters.subcategory) where.subcategory = { slug: filters.subcategory };
  if (filters.brand) where.brand = { slug: filters.brand };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price_asc"
      ? { price: "asc" }
      : filters.sort === "price_desc"
      ? { price: "desc" }
      : { createdAt: "desc" };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: PRODUCT_CARD_SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Top products by units sold; topped up with the newest products when there aren't enough orders yet. */
export async function getBestSellingProducts(limit = 8) {
  const top = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit * 2,
  });
  const ids = top.map((t) => t.productId);
  const sold = ids.length
    ? await prisma.product.findMany({
        where: { id: { in: ids }, status: "active" },
        select: PRODUCT_CARD_SELECT,
      })
    : [];
  const ranked = ids
    .map((id) => sold.find((p) => p.id === id))
    .filter((p): p is StorefrontProductCard => Boolean(p))
    .slice(0, limit);
  if (ranked.length >= limit) return ranked;

  const filler = await prisma.product.findMany({
    where: { status: "active", id: { notIn: ranked.map((p) => p.id) } },
    orderBy: { createdAt: "desc" },
    take: limit - ranked.length,
    select: PRODUCT_CARD_SELECT,
  });
  return [...ranked, ...filler];
}

/** In-stock products that are actually on sale, biggest discount first. */
export async function getDiscountedProducts(limit = 8) {
  const discounted = await prisma.product.findMany({
    where: { status: "active", compareAtPrice: { not: null }, stock: { gt: 0 } },
    take: 50,
    select: PRODUCT_CARD_SELECT,
  });
  return discounted
    .filter((p) => Number(p.compareAtPrice) > Number(p.price))
    .sort(
      (a, b) =>
        (Number(b.compareAtPrice) - Number(b.price)) / Number(b.compareAtPrice) -
        (Number(a.compareAtPrice) - Number(a.price)) / Number(a.compareAtPrice)
    )
    .slice(0, limit);
}

/** Products for homepage offer cards: biggest discounts first, then the newest. */
export async function getPromoProducts(limit = 2) {
  const byDiscount = await getDiscountedProducts(limit);
  if (byDiscount.length >= limit) return byDiscount;

  const filler = await prisma.product.findMany({
    where: { status: "active", id: { notIn: byDiscount.map((p) => p.id) } },
    orderBy: { createdAt: "desc" },
    take: limit - byDiscount.length,
    select: PRODUCT_CARD_SELECT,
  });
  return [...byDiscount, ...filler];
}

export async function getStorefrontProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      subcategory: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, name: true } },
    },
  });

  if (!product || product.status !== "active") return null;

  const related = await prisma.product.findMany({
    where: {
      status: "active",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    select: PRODUCT_CARD_SELECT,
  });

  return { product, related };
}
