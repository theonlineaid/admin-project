import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StorefrontSort = "newest" | "price_asc" | "price_desc";

/** Query params accepted by `GET /api/store/products` and storefront SSR. */
export type StorefrontProductFilters = {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  brandSlug?: string;
  sort?: StorefrontSort;
};

export const storefrontProductInclude = {
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true } },
} as const;

type ProductRowBase = {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  images: string[];
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string } | null;
};

/** Same rules as the public products API: `categorySlug` overrides `categoryId` when it resolves. */
export async function buildStorefrontProductWhere(
  filters: StorefrontProductFilters
): Promise<Prisma.ProductWhereInput> {
  const search = filters.search?.trim();
  const categorySlug = filters.categorySlug?.trim();
  const categoryId = filters.categoryId?.trim();

  const where: Prisma.ProductWhereInput = { status: "active" };
  if (categoryId) where.categoryId = categoryId;
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

  const brandSlug = filters.brandSlug?.trim();
  if (brandSlug) {
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
      select: { id: true },
    });
    if (brand) where.brandId = brand.id;
  }

  return where;
}

export async function fetchStorefrontProducts(params: {
  page?: number;
  limit?: number;
} & StorefrontProductFilters): Promise<{
  rows: ProductRowBase[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const where = await buildStorefrontProductWhere(params);
  const sort: StorefrontSort = params.sort ?? "newest";
  const orderBy =
    sort === "price_asc"
      ? ({ price: "asc" } as const)
      : sort === "price_desc"
        ? ({ price: "desc" } as const)
        : ({ createdAt: "desc" } as const);

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: storefrontProductInclude,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  return { rows, total, page, limit };
}

export async function countStorefrontProducts(
  filters: StorefrontProductFilters & { sort?: StorefrontSort },
): Promise<number> {
  const where = await buildStorefrontProductWhere(filters);
  return prisma.product.count({ where });
}

export function serializeStorefrontProductForJson(p: ProductRowBase) {
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
