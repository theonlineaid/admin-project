import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  dedupeRecentTerms,
  resolveStoreSearchSubject,
} from "@/lib/store-search-recent";

const bodySchema = z.object({
  term: z.string().min(1).max(120).transform((s) => s.trim()),
});

/** GET: recent search terms for session or anonymous visitor cookie. */
export async function GET() {
  try {
    const subject = await resolveStoreSearchSubject();
    const where = subject.userId
      ? { userId: subject.userId }
      : { visitorId: subject.visitorId! };

    const rows = await prisma.storeRecentSearch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 48,
      select: { term: true, createdAt: true },
    });

    const terms = dedupeRecentTerms(rows, 12);
    const res = NextResponse.json({ terms });
    subject.applyVisitorCookie(res);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ terms: [] as string[] }, { status: 500 });
  }
}

/** POST: record a search term (after user runs a search). */
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid term" }, { status: 400 });
    }
    const term = parsed.data.term;
    if (!term) {
      return NextResponse.json({ error: "Invalid term" }, { status: 400 });
    }

    const subject = await resolveStoreSearchSubject();
    const ownerWhere = subject.userId
      ? { userId: subject.userId }
      : { visitorId: subject.visitorId! };

    await prisma.storeRecentSearch.deleteMany({
      where: {
        ...ownerWhere,
        term: { equals: term, mode: "insensitive" },
      },
    });

    const data = subject.userId
      ? { userId: subject.userId, visitorId: null as string | null, term }
      : { userId: null as string | null, visitorId: subject.visitorId!, term };

    await prisma.storeRecentSearch.create({ data });

    const res = NextResponse.json({ ok: true });
    subject.applyVisitorCookie(res);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

/** DELETE: `?term=` removes one term; no query clears all for this subject. */
export async function DELETE(req: Request) {
  try {
    const subject = await resolveStoreSearchSubject();
    const whereBase = subject.userId
      ? { userId: subject.userId }
      : { visitorId: subject.visitorId! };

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term")?.trim();

    if (term) {
      const rows = await prisma.storeRecentSearch.findMany({
        where: whereBase,
        select: { id: true, term: true },
      });
      const toDelete = rows.filter(
        (r) => r.term.toLowerCase() === term.toLowerCase()
      );
      if (toDelete.length > 0) {
        await prisma.storeRecentSearch.deleteMany({
          where: { id: { in: toDelete.map((r) => r.id) } },
        });
      }
    } else {
      await prisma.storeRecentSearch.deleteMany({ where: whereBase });
    }

    const res = NextResponse.json({ ok: true });
    subject.applyVisitorCookie(res);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
