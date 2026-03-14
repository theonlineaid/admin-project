import { NextResponse } from "next/server";
import { listFolderResources } from "@/lib/cloudinary";

const BANNER_PREFIX = "banner/";

/** Public API: get all banner image URLs from Cloudinary banner folder. */
export async function GET() {
  try {
    const images = await listFolderResources(BANNER_PREFIX);
    const urls = images.map((img) => img.secureUrl);
    return NextResponse.json({ urls });
  } catch (e) {
    console.error("Store banner list error:", e);
    return NextResponse.json({ urls: [] });
  }
}
