type ProductAttributeRow = {
  id: string;
  attribute: {
    name: string;
    type: string;
    sortOrder: number;
  };
  attributeOption: {
    value: string;
  } | null;
  valueText: string | null;
};

/** Text / number attributes only (small “details” section — not select chips). */
export function buildStorefrontAttributeRows(
  productAttributes: ProductAttributeRow[],
): { id: string; label: string; value: string }[] {
  const rows: { id: string; label: string; value: string }[] = [];
  for (const pa of productAttributes) {
    if (pa.attribute.type === "select") continue;
    if (pa.valueText?.trim()) {
      rows.push({
        id: pa.id,
        label: pa.attribute.name,
        value: pa.valueText.trim(),
      });
    }
  }
  return rows;
}

type SelectPA = {
  attributeOptionId: string | null;
  attribute: {
    id: string;
    slug: string;
    type: string;
    name: string;
    options: Array<{
      id: string;
      value: string;
      slug: string | null;
      hex: string | null;
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

/** Select-type attributes for option chips / swatches; `slug` on option is product slug when in stock as a variant row. */
export function buildProductSelectAttributeGroups(params: {
  currentSlug: string;
  productAttributes: SelectPA[];
  siblings: SiblingRow[];
}): {
  attributeId: string;
  attributeSlug: string;
  label: string;
  selectedOptionId: string;
  options: {
    id: string;
    label: string;
    slug: string | null;
    hex: string | null;
  }[];
}[] {
  const { currentSlug, productAttributes, siblings } = params;
  const groups: {
    attributeId: string;
    attributeSlug: string;
    label: string;
    selectedOptionId: string;
    options: {
      id: string;
      label: string;
      slug: string | null;
      hex: string | null;
    }[];
  }[] = [];

  for (const pa of productAttributes) {
    if (pa.attribute.type !== "select" || pa.attribute.options.length === 0) {
      continue;
    }
    const selectedId = pa.attributeOptionId ?? "";
    const slugByOption = optionIdToSlugMap(
      pa.attribute.id,
      currentSlug,
      pa.attributeOptionId,
      siblings,
    );
    const options = pa.attribute.options.map((opt) => ({
      id: opt.id,
      label: opt.value,
      slug: slugByOption.get(opt.id) ?? null,
      hex: opt.hex,
    }));
    groups.push({
      attributeId: pa.attribute.id,
      attributeSlug: pa.attribute.slug,
      label: pa.attribute.name,
      selectedOptionId: selectedId,
      options,
    });
  }
  return groups;
}

/** One-line snapshot for order lines / invoices, e.g. "Size: Medium · Color: Black". */
export function formatOrderItemVariantSummary(product: {
  productAttributes: Array<{
    attribute: {
      name: string;
      type: string;
    };
    attributeOption: {
      value: string;
    } | null;
    valueText: string | null;
  }>;
}): string | null {
  const parts: string[] = [];
  for (const pa of product.productAttributes) {
    const label = pa.attribute.name;
    if (pa.attribute.type === "select" && pa.attributeOption) {
      parts.push(`${label}: ${pa.attributeOption.value}`);
    } else if (pa.valueText?.trim()) {
      parts.push(`${label}: ${pa.valueText.trim()}`);
    }
  }
  if (parts.length === 0) return null;
  return parts.join(" · ");
}
