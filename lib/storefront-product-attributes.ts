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
  /** All option ids assigned to this product for this attribute (e.g. S, M, L). */
  attributeOptionIds: string[];
  attribute: {
    id: string;
    slug: string;
    type: string;
    name: string;
    sortOrder?: number;
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
  currentOptionIds: string[],
  siblings: SiblingRow[],
): Map<string, string> {
  const m = new Map<string, string>();
  for (const oid of currentOptionIds) {
    if (oid) m.set(oid, currentSlug);
  }
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
  selectedOptionIds: string[];
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
    selectedOptionIds: string[];
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
    const selectedIds = pa.attributeOptionIds.filter(Boolean);
    const slugByOption = optionIdToSlugMap(
      pa.attribute.id,
      currentSlug,
      selectedIds,
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
      selectedOptionIds: selectedIds,
      options,
    });
  }
  return groups;
}

/** One-line snapshot for order lines / invoices, e.g. "Size: M, L · Color: Black". */
export function formatOrderItemVariantSummary(product: {
  productAttributes: Array<{
    attributeId: string;
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
  const byAttr = new Map<
    string,
    { label: string; type: string; optionValues: string[]; textValue: string | null }
  >();
  for (const pa of product.productAttributes) {
    let g = byAttr.get(pa.attributeId);
    if (!g) {
      g = {
        label: pa.attribute.name,
        type: pa.attribute.type,
        optionValues: [],
        textValue: null,
      };
      byAttr.set(pa.attributeId, g);
    }
    if (pa.attribute.type === "select" && pa.attributeOption) {
      g.optionValues.push(pa.attributeOption.value);
    } else if (pa.valueText?.trim()) {
      g.textValue = pa.valueText.trim();
    }
  }
  const parts: string[] = [];
  for (const g of byAttr.values()) {
    if (g.type === "select" && g.optionValues.length > 0) {
      const uniq = [...new Set(g.optionValues)];
      parts.push(`${g.label}: ${uniq.join(", ")}`);
    } else if (g.textValue) {
      parts.push(`${g.label}: ${g.textValue}`);
    }
  }
  if (parts.length === 0) return null;
  return parts.join(" · ");
}
