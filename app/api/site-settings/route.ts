import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/api-utils";
import { z } from "zod";

const HEADER_VARIANTS = ["1", "2", "3", "4", "5"] as const;
const FOOTER_VARIANTS = ["1", "2", "3", "4", "5"] as const;

const topbarItemSchema = z.object({
  id: z.string(),
  type: z.enum(["phone", "promotion", "address", "custom"]),
  value: z.string(),
});

const updateSchema = z.object({
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  siteTitle: z.string().min(1).optional().nullable(),
  headerVariant: z.enum(HEADER_VARIANTS).optional().nullable(),
  footerVariant: z.enum(FOOTER_VARIANTS).optional().nullable(),
  topbarEnabled: z.boolean().optional(),
  topbarItems: z.array(topbarItemSchema).optional().nullable(),
});

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!settings) {
      const created = await prisma.siteSettings.create({
        data: {
          siteTitle: "E-commerce",
          headerVariant: "1",
          footerVariant: "1",
        },
      });
      return NextResponse.json(created);
    }
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load site settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireAdmin(session);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let settings = await prisma.siteSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteTitle: "E-commerce",
          headerVariant: "1",
          footerVariant: "1",
        },
      });
    }

    const updated = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        ...(parsed.data.logoUrl !== undefined && { logoUrl: parsed.data.logoUrl }),
        ...(parsed.data.faviconUrl !== undefined && { faviconUrl: parsed.data.faviconUrl }),
        ...(parsed.data.siteTitle !== undefined && { siteTitle: parsed.data.siteTitle }),
        ...(parsed.data.headerVariant !== undefined && { headerVariant: parsed.data.headerVariant }),
        ...(parsed.data.footerVariant !== undefined && { footerVariant: parsed.data.footerVariant }),
        ...(parsed.data.topbarEnabled !== undefined && { topbarEnabled: parsed.data.topbarEnabled }),
        ...(parsed.data.topbarItems !== undefined && { topbarItems: parsed.data.topbarItems as object[] }),
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}
