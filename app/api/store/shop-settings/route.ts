import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeShopGridColumns } from "@/lib/shop-grid-columns";
import { normalizeShopPageSize } from "@/lib/shop-url";
import { resolveStoreSearchSubject } from "@/lib/store-search-recent";

const patchSchema = z
  .object({
    gridColumns: z.coerce.number().int().min(2).max(5).optional(),
    pageSize: z.coerce
      .number()
      .int()
      .refine((n) => [12, 24, 36, 48].includes(n))
      .optional(),
    listPage: z.coerce.number().int().min(1).optional(),
  })
  .refine((d) => d.gridColumns != null || d.pageSize != null || d.listPage != null, {
    message: "Provide at least one of gridColumns, pageSize, listPage",
  });

/** GET: viewer’s shop UI prefs (grid, page size, list page). Sets visitor cookie when needed. */
export async function GET() {
  try {
    const subject = await resolveStoreSearchSubject();
    let row = null;
    if (subject.userId) {
      row = await prisma.storeShopUserSettings.findUnique({
        where: { userId: subject.userId },
        select: {
          gridColumns: true,
          pageSize: true,
          listPage: true,
        },
      });
    } else if (subject.visitorId) {
      row = await prisma.storeShopUserSettings.findUnique({
        where: { visitorId: subject.visitorId },
        select: {
          gridColumns: true,
          pageSize: true,
          listPage: true,
        },
      });
    }
    const gridColumns = normalizeShopGridColumns(row?.gridColumns);
    const pageSize = normalizeShopPageSize(row?.pageSize);
    const listPage = row?.listPage != null && row.listPage >= 1 ? row.listPage : 1;
    const res = NextResponse.json({ gridColumns, pageSize, listPage });
    subject.applyVisitorCookie(res);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ gridColumns: 4, pageSize: 12, listPage: 1 });
  }
}

/** PATCH: update grid columns, page size (also resets to page 1), or list page. */
export async function PATCH(req: Request) {
  try {
    const subject = await resolveStoreSearchSubject();
    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors.join(", ") || "Invalid body" },
        { status: 400 },
      );
    }

    const { gridColumns, pageSize, listPage } = parsed.data;

    const update: {
      gridColumns?: number;
      pageSize?: number;
      listPage?: number;
    } = {};
    if (gridColumns != null) update.gridColumns = gridColumns;
    if (pageSize != null) {
      update.pageSize = pageSize;
      update.listPage = 1;
    } else if (listPage != null) {
      update.listPage = listPage;
    }

    const defaults = {
      gridColumns: 4,
      pageSize: 12,
      listPage: 1,
    };

    if (subject.userId) {
      await prisma.storeShopUserSettings.upsert({
        where: { userId: subject.userId },
        create: {
          userId: subject.userId,
          gridColumns: update.gridColumns ?? defaults.gridColumns,
          pageSize: update.pageSize ?? defaults.pageSize,
          listPage: update.listPage ?? defaults.listPage,
        },
        update,
      });
    } else {
      const visitorId = subject.visitorId!;
      await prisma.storeShopUserSettings.upsert({
        where: { visitorId },
        create: {
          visitorId,
          gridColumns: update.gridColumns ?? defaults.gridColumns,
          pageSize: update.pageSize ?? defaults.pageSize,
          listPage: update.listPage ?? defaults.listPage,
        },
        update,
      });
    }

    const res = NextResponse.json({ ok: true });
    subject.applyVisitorCookie(res);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
