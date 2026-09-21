import { auth } from "@/lib/auth";
import { getSiteSettings, getStorefrontCategories } from "@/lib/storefront";
import { CartProvider } from "@/components/storefront/cart-context";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings, categories] = await Promise.all([
    auth(),
    getSiteSettings(),
    getStorefrontCategories(),
  ]);

  const siteTitle = settings.siteTitle ?? "E-commerce";
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: (session.user as { role?: string }).role,
      }
    : null;

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader
          siteTitle={siteTitle}
          logoUrl={settings.logoUrl}
          user={user}
          categories={categories}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
        <SiteFooter siteTitle={siteTitle} />
      </div>
    </CartProvider>
  );
}
