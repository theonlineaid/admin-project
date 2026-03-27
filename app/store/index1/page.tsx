import { StoreHomeShell } from "@/components/store/store-home-shell";
import { getStoreHomePageData } from "@/lib/store-home-data";

export const metadata = {
  title: "Store | Browse",
  description: "Search and shop by category — alternate storefront layout.",
};

/** Alternate storefront home: same data and filters as `/`, centered hero + card layout. */
export default async function StoreIndex1Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categorySlug?: string }>;
}) {
  const sp = await searchParams;
  const data = await getStoreHomePageData({
    search: sp.search,
    categorySlug: sp.categorySlug,
  });
  return <StoreHomeShell data={data} layout="index1" />;
}
