import { NextResponse } from "next/server";
import { LOCALES } from "@/lib/locales";

export async function GET() {
  return NextResponse.json(LOCALES);
}
