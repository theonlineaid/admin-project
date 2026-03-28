import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  logo: ReactNode;
  search: ReactNode;
  actions: ReactNode;
  /** Extra classes on the outer container (e.g. `sm:h-14`). */
  className?: string;
};

/**
 * Store header row: logo left, search centered, actions right (desktop).
 * Mobile: logo + actions on one row, search full width below.
 */
export function HeaderStoreRowLayout({ logo, search, actions, className }: Props) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-center justify-between gap-2">
          {logo}
          {actions}
        </div>
        {search}
      </div>
      <div className="hidden items-center gap-2 sm:flex sm:min-h-14 sm:gap-3">
        <div className="flex min-w-0 flex-1 justify-start">{logo}</div>
        <div className="w-full min-w-0 max-w-2xl shrink-0 px-2 xl:max-w-3xl">{search}</div>
        <div className="flex min-w-0 flex-1 justify-end">{actions}</div>
      </div>
    </div>
  );
}
