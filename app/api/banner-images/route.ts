import { NextResponse } from "next/server";
import { getSession, requireSellerOrAdmin } from "@/lib/api-utils";
import { listFolderResources, deleteResource, isCloudinaryConfigured } from "@/lib/cloudinary";

const BANNER_PREFIX = "banner/";

export async function GET() {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ images: [] });
    }

    const images = await listFolderResources(BANNER_PREFIX);
    return NextResponse.json({ images });
  } catch (err) {
    console.error("Banner images list error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list banner images" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    const forbidden = requireSellerOrAdmin(session);
    if (forbidden) return forbidden;

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const publicId = body.publicId as string | undefined;
    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }
    if (!publicId.startsWith(BANNER_PREFIX)) {
      return NextResponse.json({ error: "Invalid publicId for banner folder" }, { status: 400 });
    }

    await deleteResource(publicId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Banner image delete error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
