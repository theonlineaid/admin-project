export type StoreHeaderProps = {
  variant: string;
  siteTitle: string;
  logoUrl: string | null;
  /** Flat category list for the Amazon-style search bar and nav links. */
  categories: Category[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryWithSubs = Category & {
  subcategories: { id: string; name: string; slug: string }[];
};

/** Props passed to each header variant component. */
export type HeaderVariantProps = {
  siteTitle: string;
  logoUrl: string | null;
  categories: Category[];
  categoriesWithSubs: CategoryWithSubs[];
};
