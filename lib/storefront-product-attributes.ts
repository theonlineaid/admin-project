import { getTranslated } from "@/lib/attribute-i18n";
import type { LocaleCode } from "@/lib/locales";
import { DEFAULT_LOCALE } from "@/lib/locales";

type ProductAttributeRow = {
  id: string;
  attribute: {
    name: string;
    nameTranslations: unknown;
    type: string;
    sortOrder: number;
  };
  attributeOption: {
    value: string;
    valueTranslations: unknown;
  } | null;
  valueText: string | null;
};

/** Text / number attributes only (for a small “details” section — not select options). */
export function buildStorefrontAttributeRows(
  productAttributes: ProductAttributeRow[],
  locale: LocaleCode = DEFAULT_LOCALE,
): { id: string; label: string; value: string }[] {
  const rows: { id: string; label: string; value: string }[] = [];
  for (const pa of productAttributes) {
    if (pa.attribute.type === "select") continue;
    const label = getTranslated(
      pa.attribute.nameTranslations,
      locale,
      pa.attribute.name,
    );
    if (pa.valueText?.trim()) {
      rows.push({ id: pa.id, label, value: pa.valueText.trim() });
    }
  }
  return rows;
}

type SelectPA = {
  attributeOptionId: string | null;
  attribute: {
    id: string;
    type: string;
    name: string;
    nameTranslations: unknown;
    options: Array<{
      id: string;
      value: string;
      valueTranslations: unknown;
    }>;
  };
};

type SiblingRow = {
  slug: string;
  productAttributes: Array<{
    attributeId: string;
    attributeOptionId: string | null;
  }>;
};

function optionIdToSlugMap(
  attributeId: string,
  currentSlug: string,
  currentOptionId: string | null,
  siblings: SiblingRow[],
): Map<string, string> {
  const m = new Map<string, string>();
  if (currentOptionId) m.set(currentOptionId, currentSlug);
  for (const s of siblings) {
    const pa = s.productAttributes.find((p) => p.attributeId === attributeId);
    if (pa?.attributeOptionId) m.set(pa.attributeOptionId, s.slug);
  }
  return m;
}

/** Select-type attributes as option chips; `href` is product slug when another variant exists (same name + category). */
export function buildProductSelectAttributeGroups(params: {
  currentSlug: string;
  locale?: LocaleCode;
  productAttributes: SelectPA[];
  siblings: SiblingRow[];
}): {
  attributeId: string;
  label: string;
  selectedOptionId: string;
  options: { id: string; label: string; slug: string | null }[];
}[] {
  const { currentSlug, locale = DEFAULT_LOCALE, productAttributes, siblings } =
    params;
  const groups: {
    attributeId: string;
    label: string;
    selectedOptionId: string;
    options: { id: string; label: string; slug: string | null }[];
  }[] = [];

  for (const pa of productAttributes) {
    if (pa.attribute.type !== "select" || pa.attribute.options.length === 0) {
      continue;
    }
    const selectedId = pa.attributeOptionId ?? "";
    const label = getTranslated(
      pa.attribute.nameTranslations,
      locale,
      pa.attribute.name,
    );
    const slugByOption = optionIdToSlugMap(
      pa.attribute.id,
      currentSlug,
      pa.attributeOptionId,
      siblings,
    );
    const options = pa.attribute.options.map((opt) => ({
      id: opt.id,
      label: getTranslated(opt.valueTranslations, locale, opt.value),
      slug: slugByOption.get(opt.id) ?? null,
    }));
    groups.push({
      attributeId: pa.attribute.id,
      label,
      selectedOptionId: selectedId,
      options,
    });
  }
  return groups;
}

/** One-line snapshot of all attribute values for order lines / invoices (default locale). */
export function formatOrderItemVariantSummary(product: {
  productAttributes: Array<{
    attribute: {
      name: string;
      nameTranslations: unknown;
      type: string;
    };
    attributeOption: {
      value: string;
      valueTranslations: unknown;
    } | null;
    valueText: string | null;
  }>;
}): string | null {
  const parts: string[] = [];
  for (const pa of product.productAttributes) {
    const label = getTranslated(
      pa.attribute.nameTranslations,
      DEFAULT_LOCALE,
      pa.attribute.name,
    );
    if (pa.attribute.type === "select" && pa.attributeOption) {
      const val = getTranslated(
        pa.attributeOption.valueTranslations,
        DEFAULT_LOCALE,
        pa.attributeOption.value,
      );
      parts.push(`${label}: ${val}`);
    } else if (pa.valueText?.trim()) {
      parts.push(`${label}: ${pa.valueText.trim()}`);
    }
  }
  if (parts.length === 0) return null;
  return parts.join(" · ");
}
