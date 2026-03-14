"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BannerCarousel({ urls }: { urls: string[] }) {
  const [index, setIndex] = useState(0);
  const len = urls.length;

  useEffect(() => {
    if (len <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, 5000);
    return () => clearInterval(id);
  }, [len]);

  if (!len) return null;

  return (
    <section className="relative w-full overflow-hidden bg-muted" aria-label="Banner carousel">
      <div className="relative w-full min-h-[200px] sm:min-h-[280px] aspect-[21/9]">
        {urls.map((url, i) => (
          <div
            key={url}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
          >
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      {len > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + len) % len)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % len)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2 cursor-pointer">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all cursor-pointer shrink-0 ${
                  i === index ? "w-6 bg-white shadow-sm" : "w-2 bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
