import {
  Apple,
  BookOpen,
  Dumbbell,
  Gamepad2,
  Laptop,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
  Tv,
  Watch,
  type LucideIcon,
} from "lucide-react";

// Categories have no image field, so pick an icon from the name
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/book|stationer/i, BookOpen],
  [/cloth|shirt|fashion|apparel|wear/i, Shirt],
  [/laptop|computer|pc/i, Laptop],
  [/phone|mobile|tablet|electronic/i, Smartphone],
  [/tv|televi/i, Tv],
  [/watch/i, Watch],
  [/game|gaming|console/i, Gamepad2],
  [/home|garden|furniture|kitchen|appliance/i, Sofa],
  [/sport|fitness|health|gym/i, Dumbbell],
  [/beauty|cosmetic|care/i, Sparkles],
  [/food|grocery|fruit/i, Apple],
];

export function categoryIcon(name: string): LucideIcon {
  return ICON_RULES.find(([re]) => re.test(name))?.[1] ?? Tag;
}
