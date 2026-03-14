// /lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export type UploadOptions = {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
};

export async function uploadImage(
  file: Buffer,
  mimeType: string,
  options: UploadOptions = {}
): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  folder: string;
}> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? "ecommerce",
        public_id: options.publicId,
        overwrite: options.overwrite ?? true,
      },
      (err, result) => {
        if (err) reject(err);
        else if (!result) reject(new Error("Upload returned no result"));
        else
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            folder: result.folder,
          });
      }
    );

    stream.end(file);
  });
}

/** List image resources in a folder (prefix). For fixed folder mode use prefix e.g. "banner/". */
export async function listFolderResources(prefix: string): Promise<{ publicId: string; secureUrl: string }[]> {
  if (!isCloudinaryConfigured()) return [];
  const result = await cloudinary.api.resources({
    type: "upload",
    resource_type: "image",
    prefix,
    max_results: 100,
  });
  const resources = (result as { resources?: { public_id: string; secure_url: string }[] }).resources ?? [];
  return resources.map((r) => ({ publicId: r.public_id, secureUrl: r.secure_url }));
}

/** Delete a single image by public_id. */
export async function deleteResource(publicId: string, resourceType: "image" | "video" = "image"): Promise<void> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}