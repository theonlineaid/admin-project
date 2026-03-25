import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  logo: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? undefined : v)),
  slug: z.string().min(1).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(brands);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireAdmin(session);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const slug =
      parsed.data.slug ??
      parsed.data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const brand = await prisma.brand.create({
      data: {
        name: parsed.data.name,
        logo: parsed.data.logo,
        slug,
      },
    });
    return NextResponse.json(brand);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
