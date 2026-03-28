import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export const STORE_VISITOR_COOKIE = "store_visitor_id";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  secure: process.env.NODE_ENV === "production",
};

/** Logged-in users use `userId`; guests use httpOnly `store_visitor_id` (issued on first use). */
export async function resolveStoreSearchSubject(): Promise<{
  userId: string | null;
  visitorId: string | null;
  applyVisitorCookie: (res: NextResponse) => void;
}> {
  const session = await auth();
  const userId = session?.user
    ? ((session.user as { id?: string }).id ?? null)
    : null;
  if (userId) {
    return { userId, visitorId: null, applyVisitorCookie: () => {} };
  }

  const jar = await cookies();
  let visitorId = jar.get(STORE_VISITOR_COOKIE)?.value?.trim() ?? null;
  let issued: string | null = null;
  if (!visitorId || visitorId.length < 8) {
    issued = crypto.randomUUID();
    visitorId = issued;
  }

  return {
    userId: null,
    visitorId,
    applyVisitorCookie: (res: NextResponse) => {
      if (issued) {
        res.cookies.set(STORE_VISITOR_COOKIE, issued, COOKIE_OPTS);
      }
    },
  };
}

export function dedupeRecentTerms(rows: { term: string; createdAt: Date }[], limit = 12): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    const key = r.term.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(r.term.trim());
    if (out.length >= limit) break;
  }
  return out;
}
