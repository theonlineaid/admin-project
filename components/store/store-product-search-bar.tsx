"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function StoreProductSearchBar({
  categories,
  search,
  categoryId,
  onSearchChange,
  onCategoryChange,
  className,
}: {
  categories: { id: string; name: string }[];
  search: string;
  categoryId: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:min-h-11 sm:flex-row",
        className
      )}
    >
      <div className="flex shrink-0 border-b border-border sm:border-b-0 sm:border-r">
        <Select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 min-h-10 w-full min-w-0 rounded-none border-0 bg-muted/25 px-3 py-2 text-sm shadow-none sm:h-11 sm:min-h-11 sm:min-w-[200px] sm:max-w-[240px] focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="text"
          role="searchbox"
          placeholder={
            categoryId
              ? "Search in this category…"
              : "Search products, categories, SKU…"
          }
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "h-10 min-h-10 w-full rounded-none border-0 bg-transparent pl-9 text-sm shadow-none sm:h-11 sm:min-h-11 focus-visible:ring-0 focus-visible:ring-offset-0",
            search.trim().length > 0 ? "pr-10" : "pr-3"
          )}
        />
        {search.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
