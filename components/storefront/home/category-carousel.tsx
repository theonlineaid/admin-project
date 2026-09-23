"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StorefrontCategory } from "@/lib/storefront";
import { categoryIcon } from "@/components/storefront/home/category-icon";

export function CategoryCarousel({ categories }: { categories: StorefrontCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const withStock = categories.filter((c) => c._count.products > 0);
  if (withStock.length === 0) return null;

  function scroll(direction: 1 | -1) {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="border-b border-border pb-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
          Browse by Category
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll categories left"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll categories right"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-6 flex snap-x gap-6 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-8"
      >
        {withStock.map((category) => {
          const Icon = categoryIcon(category.name);
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex w-20 shrink-0 snap-start flex-col items-center gap-3 text-center sm:w-24"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-foreground/70 transition-colors group-hover:bg-primary/10 group-hover:text-primary sm:h-24 sm:w-24">
                <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.5} />
              </span>
              <span className="line-clamp-2 text-sm leading-snug text-foreground transition-colors group-hover:text-primary">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
