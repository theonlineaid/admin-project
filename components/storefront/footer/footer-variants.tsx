"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { StorefrontCategory } from "@/lib/storefront";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type FooterVariantProps = {
  siteTitle: string;
  categories: StorefrontCategory[];
};

/** Style 1 — Columns: brand blurb + three link columns + bottom bar. */
export function FooterV1({ siteTitle }: FooterVariantProps) {
  return (
    <>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4 sm:px-6">
        <div>
          <p className="font-display text-base font-semibold text-foreground">{siteTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A marketplace for every category, from sellers you can trust.
          </p>
        </div>
        <FooterColumn
          title="Shop"
          links={[
            { href: "/products", label: "All products" },
            { href: "/cart", label: "Cart" },
            { href: "/orders", label: "Track an order" },
          ]}
        />
        <FooterColumn
          title="Account"
          links={[
            { href: "/login?callbackUrl=/account", label: "Sign in" },
            { href: "/account", label: "My account" },
          ]}
        />
        <div>
          <p className="text-sm font-medium text-foreground">Sell on {siteTitle}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Sellers manage their own catalog and orders from the seller dashboard.
          </p>
        </div>
      </div>
      <BottomBar siteTitle={siteTitle} />
    </>
  );
}

/** Style 2 — Minimal: one slim row, no columns. */
export function FooterV2({ siteTitle }: FooterVariantProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm sm:flex-row sm:px-6">
      <span className="font-display font-semibold text-foreground">{siteTitle}</span>
      <nav className="flex flex-wrap items-center justify-center gap-5 text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          All products
        </Link>
        <Link href="/cart" className="hover:text-foreground">
          Cart
        </Link>
        <Link href="/orders" className="hover:text-foreground">
          Track an order
        </Link>
        <Link href="/account" className="hover:text-foreground">
          My account
        </Link>
      </nav>
      <span className="text-muted-foreground">© {new Date().getFullYear()} {siteTitle}</span>
    </div>
  );
}

/** Style 3 — Newsletter: signup band on top, link columns below. */
export function FooterV3({ siteTitle }: FooterVariantProps) {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <>
      <div className="border-b border-border bg-primary/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6">
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              Get new arrivals and deals in your inbox
            </p>
            <p className="mt-1 text-sm text-muted-foreground">No spam, unsubscribe anytime.</p>
          </div>
          {subscribed ? (
            <p className="text-sm font-medium text-primary">Subscribed — thanks!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
              <Input type="email" required placeholder="Email address" className="bg-card" />
              <Button type="submit" className="shrink-0">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-4 py-10 sm:px-6">
        <FooterColumn
          title="Shop"
          links={[
            { href: "/products", label: "All products" },
            { href: "/cart", label: "Cart" },
          ]}
        />
        <FooterColumn
          title="Account"
          links={[
            { href: "/login?callbackUrl=/account", label: "Sign in" },
            { href: "/orders", label: "My orders" },
          ]}
        />
        <div>
          <p className="text-sm font-medium text-foreground">{siteTitle}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            A marketplace for every category.
          </p>
        </div>
      </div>
      <BottomBar siteTitle={siteTitle} />
    </>
  );
}

/** Style 4 — Mega: dense columns, categories populated live from the catalog. */
export function FooterV4({ siteTitle, categories }: FooterVariantProps) {
  const topCategories = categories.filter((c) => c._count.products > 0).slice(0, 6);

  return (
    <>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4 sm:px-6">
        <div>
          <p className="font-display text-base font-semibold text-foreground">{siteTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A marketplace for every category, from sellers you can trust.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Shop by category</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/products" className="hover:text-foreground">
                All products
              </Link>
            </li>
            {topCategories.map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <FooterColumn
          title="Account"
          links={[
            { href: "/login?callbackUrl=/account", label: "Sign in" },
            { href: "/account", label: "My account" },
            { href: "/orders", label: "My orders" },
            { href: "/cart", label: "Cart" },
          ]}
        />
        <div>
          <p className="text-sm font-medium text-foreground">Sell on {siteTitle}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Sellers manage their own catalog and orders from the seller dashboard.
          </p>
        </div>
      </div>
      <BottomBar siteTitle={siteTitle} />
    </>
  );
}

/** Style 5 — Dark banded: inverted, centered. */
export function FooterV5({ siteTitle }: FooterVariantProps) {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <span className="font-display text-lg font-semibold">{siteTitle}</span>
        <p className="max-w-sm text-sm text-background/70">
          A marketplace for every category, from sellers you can trust.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-background/70">
          <Link href="/products" className="hover:text-background">
            All products
          </Link>
          <Link href="/cart" className="hover:text-background">
            Cart
          </Link>
          <Link href="/orders" className="hover:text-background">
            Track an order
          </Link>
          <Link href="/login?callbackUrl=/account" className="hover:text-background">
            Sign in
          </Link>
        </nav>
        <span className="text-xs text-background/50">
          © {new Date().getFullYear()} {siteTitle}. All rights reserved.
        </span>
      </div>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BottomBar({ siteTitle }: { siteTitle: string }) {
  return (
    <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
      © {new Date().getFullYear()} {siteTitle}. All rights reserved.
    </div>
  );
}

export const FOOTER_VARIANTS = {
  "1": FooterV1,
  "2": FooterV2,
  "3": FooterV3,
  "4": FooterV4,
  "5": FooterV5,
} as const;
