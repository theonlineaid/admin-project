import { NextResponse } from "next/server";
import { getStorefrontBrands } from "@/lib/storefront";

export async function GET() {
  try {
    const brands = await getStorefrontBrands();
    return NextResponse.json(brands);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
