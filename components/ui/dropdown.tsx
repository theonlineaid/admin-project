"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, children, align = "end", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[8rem] rounded-lg border border-border bg-card text-card-foreground py-1 shadow-lg",
            align === "end" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  className,
  onClick,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
