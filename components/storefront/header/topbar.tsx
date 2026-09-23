import { Phone, Tag, MapPin } from "lucide-react";

export type TopbarItem = {
  id: string;
  type: "phone" | "promotion" | "address" | "custom";
  value: string;
};

const ICON = { phone: Phone, promotion: Tag, address: MapPin, custom: null };

export function TopBar({ items }: { items: TopbarItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="border-b border-border/60 bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-1.5 text-xs sm:px-6 [scrollbar-width:none]">
        {items.map((item) => {
          const Icon = ICON[item.type];
          const content =
            item.type === "phone" ? (
              <a href={`tel:${item.value}`} className="hover:underline">
                {item.value}
              </a>
            ) : (
              item.value
            );
          return (
            <span key={item.id} className="flex shrink-0 items-center gap-1.5">
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}
