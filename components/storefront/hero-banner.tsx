"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HeroBanner({ banners }: { banners: string[] }) {
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
      <div className="relative flex aspect-[21/9] w-full items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 px-8 sm:aspect-[3/1] sm:px-14">
        <div className="max-w-lg">
          <h1 className="font-display text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Everything you need, from sellers you trust.
          </h1>
          <p className="mt-3 text-primary-foreground/90">
            Browse thousands of products across every category.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-background px-6 text-sm font-medium text-foreground hover:bg-background/90"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-muted sm:aspect-[3/1]">
      {banners.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-700",
            i === active ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      {banners.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show banner ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/60"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
