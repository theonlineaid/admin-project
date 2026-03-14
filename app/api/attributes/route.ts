import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/api-utils";
import { getTranslated } from "@/lib/attribute-i18n";
import { isValidLocale } from "@/lib/locales";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  nameTranslations: z.record(z.string(), z.string()).optional(),
  slug: z.string().min(1).optional(),
  type: z.enum(["select", "text", "number"]),
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

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") ?? undefined;
    const useLocale = locale && isValidLocale(locale) ? locale : null;

    const attributes = await prisma.attribute.findMany({
      include: {
        options: { orderBy: { sortOrder: "asc" } },
        _count: { select: { productAttributes: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    if (useLocale) {
      const translated = attributes.map((attr) => ({
        ...attr,
        name: getTranslated(attr.nameTranslations, useLocale, attr.name),
        options: attr.options.map((opt) => ({
          ...opt,
          value: getTranslated(opt.valueTranslations, useLocale, opt.value),
        })),
      }));
      return NextResponse.json(translated);
    }
    return NextResponse.json(attributes);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch attributes" },
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

    const attribute = await prisma.attribute.create({
      data: {
        name: parsed.data.name,
        nameTranslations: parsed.data.nameTranslations
          ? (parsed.data.nameTranslations as object)
          : undefined,
        slug,
        type: parsed.data.type,
        sortOrder: parsed.data.sortOrder ?? 0,
        options:
          parsed.data.type === "select" && parsed.data.options?.length
            ? {
                create: parsed.data.options.map((o, i) => ({
                  value: o.value,
                  valueTranslations: o.valueTranslations
                    ? (o.valueTranslations as object)
                    : undefined,
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
    return NextResponse.json(
      { error: "Failed to create attribute" },
      { status: 500 }
    );
  }
}
