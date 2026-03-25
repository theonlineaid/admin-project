import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? undefined : v)),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true, subcategories: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl ?? undefined,
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
