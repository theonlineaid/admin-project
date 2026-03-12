"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TabsList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  href,
  className,
  children,
  ...props
}: { href: string; className?: string; children: ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all hover:text-foreground",
        active ? "bg-card text-card-foreground shadow-sm" : "",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
