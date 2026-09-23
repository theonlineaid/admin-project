"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const FRAME =
  "relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-card";

export function HeroBanner({ banners, className }: { banners: string[]; className?: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className={cn(FRAME, "flex items-center px-8 sm:px-12", className)}>
        <div className="relative z-10 max-w-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">New season</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-card-foreground sm:text-4xl">
            Everything you need, from sellers you trust.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Browse products across every category and get them delivered to your door.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Shop Now
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-10 top-1/2 hidden h-72 w-72 -translate-y-1/2 items-center justify-center rounded-full bg-primary/10 text-primary md:flex">
          <ShoppingBag className="h-28 w-28" strokeWidth={1} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(FRAME, "bg-muted", className)}>
      {banners.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="(max-width: 1024px) 100vw, 66vw"
          className={cn(
            "object-cover transition-opacity duration-700",
            i === active ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      {banners.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2 py-1.5 backdrop-blur-sm">
          {banners.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show banner ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-1 rounded-full transition-all",
                i === active ? "w-6 bg-white" : "w-3 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
