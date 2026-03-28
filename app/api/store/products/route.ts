import { NextResponse } from "next/server";
import { z } from "zod";
import type { StorefrontSort } from "@/lib/storefront-products";
import {
  fetchStorefrontProducts,
  serializeStorefrontProductForJson,
} from "@/lib/storefront-products";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(48).default(12),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  brand: z.string().optional(),
  sort: z
    .string()
    .optional()
    .transform((s): StorefrontSort | undefined =>
      s === "price_asc" || s === "price_desc" ? s : undefined
    ),
});

/** Public API: list active products for storefront. Filtering rules live in `@/lib/storefront-products`. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      categorySlug: searchParams.get("categorySlug") ?? undefined,
      brand: searchParams.get("brand") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });
    const { page, limit, search, categoryId, categorySlug, brand, sort } = parsed.success
      ? parsed.data
      : {
          page: 1,
          limit: 12,
          search: undefined,
          categoryId: undefined,
          categorySlug: undefined,
          brand: undefined,
          sort: undefined,
        };

    const { rows, total } = await fetchStorefrontProducts({
      page,
      limit,
      search,
      categoryId,
      categorySlug,
      brandSlug: brand,
      sort: sort as StorefrontSort | undefined,
    });

    return NextResponse.json({
      data: rows.map(serializeStorefrontProductForJson),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
