"use client";

import Link from "next/link";
import { Heart, Scale, ShoppingCart, Bell, User } from "lucide-react";

type ActionIconsProps = { className?: string };

export function ActionIcons({ className = "" }: ActionIconsProps) {
  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
      <Link
        href="/wishlist"
        className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Wishlist"
        aria-label="Wishlist"
      >
        <Heart className="h-5 w-5" />
      </Link>
      <Link
        href="/compare"
        className="hidden sm:flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Compare"
        aria-label="Compare"
      >
        <Scale className="h-5 w-5" />
      </Link>
      <Link
        href="/cart"
        className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Cart"
        aria-label="Cart"
      >
        <ShoppingCart className="h-5 w-5" />
      </Link>
      <Link
        href="/notifications"
        className="hidden sm:flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </Link>
      <Link
        href="/login"
        className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Account"
        aria-label="Account"
      >
        <User className="h-5 w-5" />
      </Link>
    </div>
  );
}
