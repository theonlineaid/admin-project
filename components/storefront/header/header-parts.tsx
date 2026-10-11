"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Package,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Menu,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { useCart } from "@/components/storefront/cart-context";
import { useWishlist } from "@/components/storefront/wishlist-context";
import type { StorefrontCategory } from "@/lib/storefront";
import { cn, formatCurrency } from "@/lib/utils";

export type SiteUser = { name?: string | null; email?: string | null; role?: string } | null;

export function Logo({ siteTitle, logoUrl }: { siteTitle: string; logoUrl: string | null }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      {logoUrl ? (
        <Image src={logoUrl} alt={siteTitle} width={32} height={32} className="rounded" />
      ) : null}
      <span className="font-display text-lg font-semibold text-foreground">{siteTitle}</span>
    </Link>
  );
}

export function SearchForm({ className, placeholder }: { className?: string; placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [suggestions, setSuggestions] = useState<{
    products: Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      compareAtPrice: number | null;
      image: string | null;
      categoryName: string;
    }>;
    categories: Array<{ id: string; name: string; slug: string }>;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/storefront/search?q=${encodeURIComponent(q.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.products?.length || data.categories?.length) {
            setSuggestions(data);
            setIsOpen(true);
          } else {
            setSuggestions(null);
            setIsOpen(false);
          }
        })
        .catch(() => {
          setSuggestions(null);
          setIsOpen(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setIsOpen(false);
    const query = q.trim();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (suggestions) setIsOpen(true);
            }}
            placeholder={placeholder ?? "Search products, brands, and categories"}
            className="pl-9 pr-4"
          />
        </div>
      </form>

      {/* Live Search Dropdown */}
      {isOpen && suggestions && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {suggestions.categories.length > 0 && (
            <div className="border-b border-border/60 bg-muted/30 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {suggestions.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {suggestions.products.length > 0 && (
            <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
              {suggestions.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {formatCurrency(p.price)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-border bg-muted/40 p-2 text-center">
            <button
              type="button"
              onClick={handleSearch}
              className="text-xs font-semibold text-primary hover:underline"
            >
              See all results for &quot;{q}&quot; &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export type HeaderTone = "onLight" | "onDark" | "onPrimary";

const TONE_TRIGGER = {
  onLight: "text-foreground hover:bg-muted",
  onDark: "text-background hover:bg-background/10",
  onPrimary: "text-primary-foreground hover:bg-primary-foreground/10",
} as const;

export function WishlistButton({ tone = "onLight" }: { tone?: HeaderTone }) {
  const { wishlistCount } = useWishlist();
  return (
    <Link
      href="/wishlist"
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
        TONE_TRIGGER[tone]
      )}
      aria-label="Wishlist"
      title="View wishlist"
    >
      <Heart className="h-5 w-5" />
      {wishlistCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-semibold text-white shadow-xs">
          {wishlistCount}
        </span>
      ) : null}
    </Link>
  );
}

export function WishlistButtonLabeled({ tone = "onLight" }: { tone?: HeaderTone }) {
  const { wishlistCount } = useWishlist();
  return (
    <Link
      href="/wishlist"
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        TONE_TRIGGER[tone]
      )}
    >
      <Heart className="h-5 w-5" />
      Wishlist
      {wishlistCount > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-semibold text-white shadow-xs">
          {wishlistCount}
        </span>
      ) : null}
    </Link>
  );
}

export function CartButton({ tone = "onLight" }: { tone?: HeaderTone }) {
  const { count, openCart } = useCart();
  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
        TONE_TRIGGER[tone]
      )}
      aria-label="Cart"
      title="Open cart drawer"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-semibold text-white shadow-xs">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function CartButtonLabeled({ tone = "onLight" }: { tone?: HeaderTone }) {
  const { count, openCart } = useCart();
  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        TONE_TRIGGER[tone]
      )}
      title="Open cart drawer"
    >
      <ShoppingCart className="h-5 w-5" />
      Cart
      {count > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-semibold text-white shadow-xs">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function AccountMenu({
  user,
  labeled,
  tone = "onLight",
}: {
  user: SiteUser;
  labeled?: boolean;
  tone?: HeaderTone;
}) {
  const router = useRouter();

  if (!user) {
    return (
      <Link
        href="/login?callbackUrl=/account"
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium",
          TONE_TRIGGER[tone],
          labeled && "gap-2 px-3"
        )}
      >
        {labeled ? <User className="h-5 w-5" /> : null}
        Sign in
      </Link>
    );
  }

  return (
    <Dropdown
      trigger={
        labeled ? (
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              TONE_TRIGGER[tone]
            )}
          >
            <User className="h-5 w-5" /> Account
          </button>
        ) : (
          <button
            type="button"
            className={cn("flex h-10 w-10 items-center justify-center rounded-lg", TONE_TRIGGER[tone])}
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </button>
        )
      }
    >
      <div className="px-3 py-2 text-sm">
        <p className="font-medium text-card-foreground">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <DropdownItem onClick={() => router.push("/orders")}>
        <Package className="mr-2 h-4 w-4" /> My orders
      </DropdownItem>
      <DropdownItem onClick={() => router.push("/wishlist")}>
        <Heart className="mr-2 h-4 w-4" /> My Wishlist
      </DropdownItem>
      {user.role === "admin" || user.role === "seller" ? (
        <DropdownItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
        </DropdownItem>
      ) : null}
      <DropdownItem onClick={() => signOut({ callbackUrl: "/" })}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </DropdownItem>
    </Dropdown>
  );
}

function CategoryPanel({ categories }: { categories: StorefrontCategory[] }) {
  return (
    <div className="grid w-[min(90vw,40rem)] grid-cols-2 gap-x-6 gap-y-4 p-4 sm:grid-cols-3">
      {categories.map((category) => (
        <div key={category.id}>
          <Link
            href={`/products?category=${category.slug}`}
            className="text-sm font-semibold text-card-foreground hover:text-primary"
          >
            {category.name}
          </Link>
          {category.subcategories.length > 0 ? (
            <ul className="mt-1.5 space-y-1">
              {category.subcategories.slice(0, 5).map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/products?subcategory=${sub.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CategoryMegaMenu({
  categories,
  trigger,
}: {
  categories: StorefrontCategory[];
  trigger?: ReactNode;
}) {
  const withStock = categories.filter((c) => c._count.products > 0);
  if (withStock.length === 0) return null;

  return (
    <Dropdown
      align="start"
      trigger={
        trigger ?? (
          <button
            type="button"
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            All categories <ChevronDown className="h-4 w-4" />
          </button>
        )
      }
    >
      <CategoryPanel categories={withStock} />
    </Dropdown>
  );
}

export function HamburgerMenu({
  categories,
  tone = "onLight",
}: {
  categories: StorefrontCategory[];
  tone?: HeaderTone;
}) {
  const withStock = categories.filter((c) => c._count.products > 0);

  return (
    <Dropdown
      align="start"
      trigger={
        <button
          type="button"
          className={cn("flex h-10 w-10 items-center justify-center rounded-lg", TONE_TRIGGER[tone])}
          aria-label="Browse categories"
        >
          <Menu className="h-5 w-5" />
        </button>
      }
    >
      {withStock.length > 0 ? (
        <CategoryPanel categories={withStock} />
      ) : (
        <Link href="/products" className="block px-4 py-3 text-sm text-card-foreground">
          Browse all products
        </Link>
      )}
    </Dropdown>
  );
}

export function DeliveryLocation({ label, tone = "onLight" }: { label?: string; tone?: HeaderTone }) {
  return (
    <span
      className={cn(
        "hidden shrink-0 items-center gap-1.5 text-xs lg:flex",
        tone === "onDark"
          ? "text-background/70"
          : tone === "onPrimary"
          ? "text-primary-foreground/75"
          : "text-muted-foreground"
      )}
    >
      Deliver to
      <span
        className={cn(
          "font-medium",
          tone === "onDark" ? "text-background" : tone === "onPrimary" ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {label ?? "your location"}
      </span>
    </span>
  );
}

export function LanguageCurrency({ tone = "onLight" }: { tone?: HeaderTone }) {
  return (
    <span
      className={cn(
        "hidden shrink-0 items-center gap-1 text-xs sm:flex",
        tone === "onDark"
          ? "text-background/70"
          : tone === "onPrimary"
          ? "text-primary-foreground/75"
          : "text-muted-foreground"
      )}
    >
      EN <span aria-hidden>/</span> USD
    </span>
  );
}
