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

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  type: z.enum(["select", "text", "number"]),
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

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attributes = await prisma.attribute.findMany({
      include: {
        options: { orderBy: { sortOrder: "asc" } },
        _count: { select: { productAttributes: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(attributes);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch attributes" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (
      parsed.data.type === "select" &&
      (!parsed.data.options || parsed.data.options.length === 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Select attributes need at least one value (e.g. M, L, XL or 40, 41, 42). Add a row under Values.",
        },
        { status: 400 },
      );
    }

    const slug = resolveAttributeSlug(parsed.data.name, parsed.data.slug);

    const attribute = await prisma.attribute.create({
      data: {
        name: parsed.data.name,
        slug,
        type: parsed.data.type,
        sortOrder: parsed.data.sortOrder ?? 0,
        options:
          parsed.data.type === "select" && parsed.data.options?.length
            ? {
                create: parsed.data.options.map((o, i) => ({
                  value: o.value,
                  slug: o.slug?.trim() || null,
                  hex: normalizeOptionHex(o.hex ?? undefined),
                  sortOrder: i,
                })),
              }
            : undefined,
      },
      include: { options: true },
    });
    return NextResponse.json(attribute);
  } catch (e) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "That key (slug) is already used. Set a different “Key / slug” — e.g. clothing-size for shirts and eu-shoe-size for sneakers.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create attribute" },
      { status: 500 },
    );
  }
}
