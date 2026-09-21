import { NextResponse } from "next/server";
import { getStorefrontCategories } from "@/lib/storefront";

export async function GET() {
  try {
    const categories = await getStorefrontCategories();
    return NextResponse.json(categories);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
