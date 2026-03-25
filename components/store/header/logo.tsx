"use client";

import Link from "next/link";

type LogoProps = {
  siteTitle: string;
  logoUrl: string | null;
  className?: string;
};

export function Logo({ siteTitle, logoUrl, className = "" }: LogoProps) {
  const content = logoUrl ? (
    <img src={logoUrl} alt="" className="h-8 w-auto max-w-[140px] object-contain" />
  ) : (
    <span className="font-semibold text-foreground">{siteTitle}</span>
  );
  return (
    <Link href="/" className={`flex shrink-0 items-center font-semibold text-foreground ${className}`}>
      {content}
    </Link>
  );
}
