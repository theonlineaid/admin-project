import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeShopGridColumns } from "@/lib/shop-grid-columns";
import {
  countStorefrontProducts,
  fetchStorefrontProducts,
  type StorefrontSort,
} from "@/lib/storefront-products";
import { normalizeShopPageSize } from "@/lib/shop-url";
import { STORE_VISITOR_COOKIE } from "@/lib/store-search-recent";

type Viewer = { userId: string; visitorId: null } | { userId: null; visitorId: string } | null;

async function getViewer(): Promise<Viewer> {
  const session = await auth();
  const userId = session?.user
    ? ((session.user as { id?: string }).id ?? null)
    : null;
  if (userId) return { userId, visitorId: null };

  const jar = await cookies();
  const visitorId = jar.get(STORE_VISITOR_COOKIE)?.value?.trim() ?? null;
  if (!visitorId || visitorId.length < 8) return null;
  return { userId: null, visitorId };
}

async function syncPrefsRow(
  viewer: Viewer,
  filterKey: string,
): Promise<{
  gridColumns: number;
  pageSize: number;
  listPage: number;
  persist: boolean;
  userId: string | null;
  visitorId: string | null;
}> {
  const defaults = {
    gridColumns: 4,
    pageSize: 12,
    listPage: 1,
    persist: false as boolean,
    userId: null as string | null,
    visitorId: null as string | null,
  };

  if (!viewer) {
    return { ...defaults, listPage: 1 };
  }

  if (viewer.userId) {
    const uid = viewer.userId;
    let row = await prisma.storeShopUserSettings.findUnique({
      where: { userId: uid },
    });
    if (!row) {
      row = await prisma.storeShopUserSettings.create({
        data: {
          userId: uid,
          gridColumns: 4,
          pageSize: 12,
          listPage: 1,
          shopListFilterKey: filterKey,
        },
      });
      return {
        gridColumns: normalizeShopGridColumns(row.gridColumns),
        pageSize: normalizeShopPageSize(row.pageSize),
        listPage: 1,
        persist: true,
        userId: uid,
        visitorId: null,
      };
    }
    if (row.shopListFilterKey !== filterKey) {
      await prisma.storeShopUserSettings.update({
        where: { userId: uid },
        data: { listPage: 1, shopListFilterKey: filterKey },
      });
      return {
        gridColumns: normalizeShopGridColumns(row.gridColumns),
        pageSize: normalizeShopPageSize(row.pageSize),
        listPage: 1,
        persist: true,
        userId: uid,
        visitorId: null,
      };
    }
    return {
      gridColumns: normalizeShopGridColumns(row.gridColumns),
      pageSize: normalizeShopPageSize(row.pageSize),
      listPage: Math.max(1, row.listPage),
      persist: true,
      userId: uid,
      visitorId: null,
    };
  }

  const vid = viewer.visitorId;
  if (!vid) return defaults;

  let row = await prisma.storeShopUserSettings.findUnique({
    where: { visitorId: vid },
  });
  if (!row) {
    row = await prisma.storeShopUserSettings.create({
      data: {
        visitorId: vid,
        gridColumns: 4,
        pageSize: 12,
        listPage: 1,
        shopListFilterKey: filterKey,
      },
    });
    return {
      gridColumns: normalizeShopGridColumns(row.gridColumns),
      pageSize: normalizeShopPageSize(row.pageSize),
      listPage: 1,
      persist: true,
      userId: null,
      visitorId: vid,
    };
  }
  if (row.shopListFilterKey !== filterKey) {
    await prisma.storeShopUserSettings.update({
      where: { visitorId: vid },
      data: { listPage: 1, shopListFilterKey: filterKey },
    });
    return {
      gridColumns: normalizeShopGridColumns(row.gridColumns),
      pageSize: normalizeShopPageSize(row.pageSize),
      listPage: 1,
      persist: true,
      userId: null,
      visitorId: vid,
    };
  }
  return {
    gridColumns: normalizeShopGridColumns(row.gridColumns),
    pageSize: normalizeShopPageSize(row.pageSize),
    listPage: Math.max(1, row.listPage),
    persist: true,
    userId: null,
    visitorId: vid,
  };
}

async function persistListPage(
  prefs: { userId: string | null; visitorId: string | null; persist: boolean },
  listPage: number,
) {
  if (!prefs.persist) return;
  if (prefs.userId) {
    await prisma.storeShopUserSettings.update({
      where: { userId: prefs.userId },
      data: { listPage },
    });
    return;
  }
  if (prefs.visitorId) {
    await prisma.storeShopUserSettings.update({
      where: { visitorId: prefs.visitorId },
      data: { listPage },
    });
  }
}

/**
 * Server-only: loads products using DB-backed page size + list page (per viewer).
 * Resets list page to 1 when filters (filterKey) change; clamps page to total pages.
 */
export async function resolveShopProductListing(params: {
  filterKey: string;
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  sort: StorefrontSort;
}): Promise<{
  gridColumns: number;
  pageSize: number;
  listPage: number;
  total: number;
  totalPages: number;
  productResult: Awaited<ReturnType<typeof fetchStorefrontProducts>>;
}> {
  const viewer = await getViewer();
  const prefs = await syncPrefsRow(viewer, params.filterKey);

  const filterArgs = {
    search: params.search,
    categorySlug: params.categorySlug,
    brandSlug: params.brandSlug,
    sort: params.sort,
  };

  const total = await countStorefrontProducts(filterArgs);
  const totalPages = Math.max(1, Math.ceil(total / prefs.pageSize));
  let listPage = Math.min(Math.max(1, prefs.listPage), totalPages);

  if (prefs.persist && listPage !== prefs.listPage) {
    await persistListPage(prefs, listPage);
  }

  const productResult = await fetchStorefrontProducts({
    page: listPage,
    limit: prefs.pageSize,
    ...filterArgs,
  });

  return {
    gridColumns: prefs.gridColumns,
    pageSize: prefs.pageSize,
    listPage,
    total,
    totalPages,
    productResult,
  };
}
