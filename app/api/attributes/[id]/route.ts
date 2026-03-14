import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/api-utils";
import { getTranslated } from "@/lib/attribute-i18n";
import { isValidLocale } from "@/lib/locales";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  nameTranslations: z.record(z.string(), z.string()).optional(),
  slug: z.string().min(1).optional(),
  type: z.enum(["select", "text", "number"]).optional(),
  sortOrder: z.number().int().optional(),
  options: z
    .array(
      z.object({
        value: z.string().min(1),
        valueTranslations: z.record(z.string(), z.string()).optional(),
      })
    )
    .optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") ?? undefined;
    const useLocale = locale && isValidLocale(locale) ? locale : null;

    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    if (!attribute) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }
    if (useLocale) {
      return NextResponse.json({
        ...attribute,
        name: getTranslated(attribute.nameTranslations, useLocale, attribute.name),
        options: attribute.options.map((opt) => ({
          ...opt,
          value: getTranslated(opt.valueTranslations, useLocale, opt.value),
        })),
      });
    }
    return NextResponse.json(attribute);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch attribute" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const forbidden = requireAdmin(session);
    if (forbidden) return forbidden;

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.name != null) data.name = parsed.data.name;
    if (parsed.data.nameTranslations !== undefined)
      data.nameTranslations = parsed.data.nameTranslations as object;
    if (parsed.data.slug != null) data.slug = parsed.data.slug;
    if (parsed.data.type != null) data.type = parsed.data.type;
    if (parsed.data.sortOrder != null) data.sortOrder = parsed.data.sortOrder;

    if (parsed.data.options != null) {
      await prisma.attributeOption.deleteMany({ where: { attributeId: id } });
      if (parsed.data.options.length > 0) {
        data.options = {
          create: parsed.data.options.map((o, i) => ({
            value: o.value,
            valueTranslations: o.valueTranslations
              ? (o.valueTranslations as object)
              : undefined,
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
    return NextResponse.json(
      { error: "Failed to update attribute" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const forbidden = requireAdmin(session);
    if (forbidden) return forbidden;

    const { id } = await params;
    await prisma.attribute.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete attribute" },
      { status: 500 }
    );
  }
}
