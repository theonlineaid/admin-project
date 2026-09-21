import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (settings) return settings;
  return prisma.siteSettings.create({
    data: { siteTitle: "E-commerce", headerVariant: "1", footerVariant: "1" },
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
