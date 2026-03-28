import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireSellerOrAdmin } from "@/lib/api-utils";
import { resolveAttributeSlug } from "@/lib/attribute-slug";
import { z } from "zod";

function normalizeOptionHex(s: string | null | undefined): string | null {
  const t = typeof s === "string" ? s.trim() : "";
  if (!t) return null;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(t) ? t : null;
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  type: z.enum(["select", "text", "number"]).optional(),
  sortOrder: z.number().int().optional(),
  options: z
    .array(
      z.object({
        value: z.string().min(1),
        slug: z.string().optional().nullable(),
        hex: z.string().optional().nullable(),
      }),
    )
    .optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    if (!attribute) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }
    return NextResponse.json(attribute);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch attribute" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const { id } = await params;
    const existing = await prisma.attribute.findUnique({
      where: { id },
      select: { type: true, name: true, slug: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const nextType = parsed.data.type ?? existing.type;
    if (
      parsed.data.options !== undefined &&
      parsed.data.options.length === 0 &&
      nextType === "select"
    ) {
      return NextResponse.json(
        {
          error:
            "Select attributes must keep at least one value. Add sizes or switch type to Text/Number.",
        },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.name != null) data.name = parsed.data.name;
    if (parsed.data.slug != null) {
      data.slug = resolveAttributeSlug(
        parsed.data.name ?? existing.name,
        parsed.data.slug,
      );
    }
    if (parsed.data.type != null) data.type = parsed.data.type;
    if (parsed.data.sortOrder != null) data.sortOrder = parsed.data.sortOrder;

    if (parsed.data.options != null) {
      await prisma.attributeOption.deleteMany({ where: { attributeId: id } });
      if (parsed.data.options.length > 0) {
        data.options = {
          create: parsed.data.options.map((o, i) => ({
            value: o.value,
            slug: o.slug?.trim() || null,
            hex: normalizeOptionHex(o.hex ?? undefined),
            sortOrder: i,
          })),
        };
      }
    }

    const attribute = await prisma.attribute.update({
      where: { id },
      data,
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json(attribute);
  } catch (e) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "That key (slug) is already used by another attribute. Pick a unique key (e.g. eu-shoe-size).",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update attribute" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const { id } = await params;
    await prisma.attribute.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete attribute" },
      { status: 500 },
    );
  }
}
