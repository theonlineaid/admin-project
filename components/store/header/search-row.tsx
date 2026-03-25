"use client";

import { SearchBarWithPanel } from "../search-bar-with-panel";

type SearchRowProps = { className?: string };

export function SearchRow({ className = "" }: SearchRowProps) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 max-w-2xl ${className}`}>
      <SearchBarWithPanel />
    </div>
  );
}
