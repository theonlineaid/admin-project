import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  slug: z.string().min(1).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const where = categoryId ? { categoryId } : {};

    const subcategories = await prisma.subcategory.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(subcategories);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
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

    const subcategory = await prisma.subcategory.create({
      data: {
        name: parsed.data.name,
        categoryId: parsed.data.categoryId,
        slug,
      },
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json(subcategory);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
