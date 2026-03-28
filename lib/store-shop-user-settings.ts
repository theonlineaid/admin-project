import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeShopGridColumns } from "@/lib/shop-grid-columns";
import { STORE_VISITOR_COOKIE } from "@/lib/store-search-recent";

/** Server-only: grid column preference for the current session (user or visitor cookie). */
export async function getShopGridColumnsForViewer(): Promise<number> {
  const session = await auth();
  const userId = session?.user
    ? ((session.user as { id?: string }).id ?? null)
    : null;

  if (userId) {
    const row = await prisma.storeShopUserSettings.findUnique({
      where: { userId },
      select: { gridColumns: true },
    });
    return normalizeShopGridColumns(row?.gridColumns);
  }

  const jar = await cookies();
  const visitorId = jar.get(STORE_VISITOR_COOKIE)?.value?.trim() ?? null;
  if (!visitorId || visitorId.length < 8) return 4;

  const row = await prisma.storeShopUserSettings.findUnique({
    where: { visitorId },
    select: { gridColumns: true },
  });
  return normalizeShopGridColumns(row?.gridColumns);
}
