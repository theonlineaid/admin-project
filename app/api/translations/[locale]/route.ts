import { NextResponse } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@/lib/locales";
import path from "path";
import fs from "fs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!locale || !isValidLocale(locale)) {
    return NextResponse.json(
      { error: "Invalid or unsupported locale" },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), "messages", `${locale}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const messages = JSON.parse(raw) as Record<string, unknown>;
    return NextResponse.json({ locale, messages });
  } catch (e) {
    console.error(e);
    // Fallback to default locale if file missing
    try {
      const fallbackPath = path.join(
        process.cwd(),
        "messages",
        `${DEFAULT_LOCALE}.json`
      );
      const raw = fs.readFileSync(fallbackPath, "utf-8");
      const messages = JSON.parse(raw) as Record<string, unknown>;
      return NextResponse.json({ locale: DEFAULT_LOCALE, messages });
    } catch {
      return NextResponse.json(
        { error: "Translations unavailable" },
        { status: 500 }
      );
    }
  }
}
