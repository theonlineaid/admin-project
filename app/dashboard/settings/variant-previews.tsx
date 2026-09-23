function Bar({ className }: { className?: string }) {
  return <div className={`h-1.5 rounded-full ${className ?? "bg-current opacity-40"}`} />;
}

function Dot({ className }: { className?: string }) {
  return <div className={`h-2.5 w-2.5 rounded-full ${className ?? "bg-current opacity-40"}`} />;
}

export function HeaderPreview({ variant }: { variant: string }) {
  switch (variant) {
    case "1":
      return (
        <div className="w-full overflow-hidden rounded-md border border-border">
          <div className="flex items-center gap-1.5 bg-foreground px-2 py-2">
            <div className="h-2 w-6 rounded-sm bg-background/80" />
            <div className="ml-1 h-2 w-10 rounded-full bg-background/30" />
            <div className="ml-auto h-2 w-2 rounded-full bg-background/60" />
            <div className="h-2 w-2 rounded-full bg-background/60" />
          </div>
          <div className="flex items-center gap-1 bg-foreground/90 px-2 py-1.5">
            <div className="h-1.5 w-3 rounded-sm bg-background/50" />
            <div className="h-1.5 w-4 rounded-full bg-background/40" />
            <div className="h-1.5 w-4 rounded-full bg-background/40" />
            <div className="h-1.5 w-4 rounded-full bg-background/40" />
          </div>
        </div>
      );
    case "2":
      return (
        <div className="w-full overflow-hidden rounded-md border border-border">
          <div className="flex items-center gap-1.5 bg-primary px-2 py-2.5">
            <div className="h-2 w-5 rounded-sm bg-primary-foreground/80" />
            <div className="ml-1 h-2.5 flex-1 rounded-full bg-primary-foreground/90" />
            <Dot className="bg-primary-foreground/70" />
            <Dot className="bg-primary-foreground/70" />
          </div>
          <div className="flex items-center gap-1.5 bg-card px-2 py-1.5">
            <Dot className="bg-primary/40" />
            <Dot className="bg-primary/40" />
            <Dot className="bg-primary/40" />
            <Dot className="bg-primary/40" />
          </div>
        </div>
      );
    case "3":
      return (
        <div className="w-full overflow-hidden rounded-md border border-border">
          <div className="flex items-center justify-between bg-card px-2 py-3">
            <div className="h-2 w-2 rounded-sm bg-foreground/50" />
            <div className="h-2 w-8 rounded-sm bg-foreground/60" />
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-foreground/50" />
              <div className="h-2 w-2 rounded-full bg-foreground/50" />
              <div className="h-2 w-2 rounded-full bg-foreground/50" />
            </div>
          </div>
        </div>
      );
    case "4":
      return (
        <div className="w-full overflow-hidden rounded-md border border-border">
          <div className="flex items-center gap-1.5 bg-card px-2 py-2">
            <div className="h-2 w-5 rounded-sm bg-foreground/60" />
            <div className="h-2 w-9 rounded border border-foreground/30" />
            <div className="ml-1 h-2 flex-1 rounded-full bg-muted" />
            <Dot className="bg-foreground/40" />
          </div>
          <div className="flex items-center gap-2 border-t border-border px-2 py-1.5">
            <Bar className="w-6 bg-foreground/30" />
            <Bar className="w-6 bg-foreground/30" />
            <Bar className="w-6 bg-foreground/30" />
          </div>
        </div>
      );
    case "5":
      return (
        <div className="w-full overflow-hidden rounded-md border border-border">
          <div className="flex items-center gap-1.5 bg-card px-2 py-2.5">
            <div className="h-2 w-5 rounded-sm bg-foreground/60" />
            <div className="ml-1 h-2.5 flex-1 rounded-full bg-muted" />
            <Bar className="w-5 bg-foreground/30" />
            <Dot className="bg-foreground/40" />
          </div>
          <div className="border-t border-border bg-card px-2 py-1.5">
            <div className="flex gap-2">
              <Bar className="w-5 bg-primary/50" />
              <Bar className="w-5 bg-foreground/30" />
              <Bar className="w-5 bg-foreground/30" />
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function FooterPreview({ variant }: { variant: string }) {
  switch (variant) {
    case "1":
      return (
        <div className="w-full overflow-hidden rounded-md border border-border bg-card">
          <div className="grid grid-cols-4 gap-1.5 px-2 py-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Bar className="w-6 bg-foreground/50" />
                <Bar className="w-5 bg-foreground/25" />
                <Bar className="w-5 bg-foreground/25" />
              </div>
            ))}
          </div>
          <div className="border-t border-border px-2 py-1">
            <Bar className="mx-auto w-10 bg-foreground/25" />
          </div>
        </div>
      );
    case "2":
      return (
        <div className="flex w-full items-center justify-between overflow-hidden rounded-md border border-border bg-card px-2 py-3">
          <Bar className="w-8 bg-foreground/50" />
          <div className="flex gap-1.5">
            <Bar className="w-4 bg-foreground/25" />
            <Bar className="w-4 bg-foreground/25" />
            <Bar className="w-4 bg-foreground/25" />
          </div>
        </div>
      );
    case "3":
      return (
        <div className="w-full overflow-hidden rounded-md border border-border bg-card">
          <div className="flex flex-col items-center gap-1.5 bg-primary/10 px-2 py-2.5">
            <Bar className="w-14 bg-foreground/50" />
            <div className="h-2.5 w-full rounded-full bg-card" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 px-2 py-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1">
                <Bar className="w-6 bg-foreground/40" />
                <Bar className="w-5 bg-foreground/20" />
              </div>
            ))}
          </div>
        </div>
      );
    case "4":
      return (
        <div className="w-full overflow-hidden rounded-md border border-border bg-card">
          <div className="grid grid-cols-4 gap-1 px-2 py-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Bar className="w-6 bg-foreground/50" />
                <Bar className="w-5 bg-foreground/25" />
                <Bar className="w-5 bg-foreground/25" />
                <Bar className="w-5 bg-foreground/25" />
              </div>
            ))}
          </div>
          <div className="border-t border-border px-2 py-1">
            <Bar className="mx-auto w-10 bg-foreground/25" />
          </div>
        </div>
      );
    case "5":
      return (
        <div className="flex w-full flex-col items-center gap-1.5 overflow-hidden rounded-md border border-border bg-foreground px-2 py-3">
          <Bar className="w-10 bg-background/70" />
          <div className="flex gap-1.5">
            <Bar className="w-4 bg-background/40" />
            <Bar className="w-4 bg-background/40" />
            <Bar className="w-4 bg-background/40" />
          </div>
        </div>
      );
    default:
      return null;
  }
}
