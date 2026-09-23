import Link from "next/link";

export function SectionHeading({
  title,
  subtitle,
  href,
  centered,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  centered?: boolean;
}) {
  if (centered) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex h-9 shrink-0 items-center rounded-md border border-border bg-card px-4 text-xs font-medium text-foreground hover:bg-muted"
        >
          View All
        </Link>
      ) : null}
    </div>
  );
}
