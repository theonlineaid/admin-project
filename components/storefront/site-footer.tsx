import Link from "next/link";

export function SiteFooter({ siteTitle }: { siteTitle: string }) {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4 sm:px-6">
        <div>
          <p className="font-display text-base font-semibold text-foreground">{siteTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A marketplace for every category, from sellers you can trust.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/products" className="hover:text-foreground">
                All products
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-foreground">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-foreground">
                Track an order
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/login?callbackUrl=/account" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-foreground">
                My account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Sell on {siteTitle}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Sellers manage their own catalog and orders from the seller dashboard.
          </p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {siteTitle}. All rights reserved.
      </div>
    </footer>
  );
}
