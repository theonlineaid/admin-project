"use client";

import { AmazonSearchBar } from "@/components/store/amazon-search-bar";
import type { Category } from "./types";

type SearchRowProps = { className?: string; categories: Category[] };

export function SearchRow({ className = "", categories }: SearchRowProps) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 max-w-2xl ${className}`}>
      <AmazonSearchBar categories={categories} className="w-full" />
    </div>
  );
}
