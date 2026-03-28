import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeShopGridColumns } from "@/lib/shop-grid-columns";
import { resolveStoreSearchSubject } from "@/lib/store-search-recent";

const patchSchema = z.object({
  gridColumns: z.coerce.number().int().min(2).max(5),
});

/** GET: current viewer’s shop grid column count (2–5). Sets visitor cookie when needed. */
export async function GET() {
  try {
    const subject = await resolveStoreSearchSubject();
    let row = null;
    if (subject.userId) {
      row = await prisma.storeShopUserSettings.findUnique({
        where: { userId: subject.userId },
        select: { gridColumns: true },
      });
    } else if (subject.visitorId) {
      row = await prisma.storeShopUserSettings.findUnique({
        where: { visitorId: subject.visitorId },
        select: { gridColumns: true },
      });
    }
    const gridColumns = normalizeShopGridColumns(row?.gridColumns);
    const res = NextResponse.json({ gridColumns });
    subject.applyVisitorCookie(res);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ gridColumns: 4 });
  }
}

/** PATCH: save viewer’s preferred grid columns (2–5). */
export async function PATCH(req: Request) {
  try {
    const subject = await resolveStoreSearchSubject();
    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid gridColumns (2–5)" }, { status: 400 });
    }
    const gridColumns = parsed.data.gridColumns;

    if (subject.userId) {
      await prisma.storeShopUserSettings.upsert({
        where: { userId: subject.userId },
        create: { userId: subject.userId, gridColumns },
        update: { gridColumns },
      });
    } else {
      const visitorId = subject.visitorId!;
      await prisma.storeShopUserSettings.upsert({
        where: { visitorId },
        create: { visitorId, gridColumns },
        update: { gridColumns },
      });
    }

    const res = NextResponse.json({ ok: true, gridColumns });
    subject.applyVisitorCookie(res);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
