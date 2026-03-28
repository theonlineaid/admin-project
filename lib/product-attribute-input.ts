import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

/** Payload row for product create/update — use `allOptions: true` to attach every catalog option for that attribute id. */
export const productAttributeInputSchema = z.object({
  attributeId: z.string(),
  attributeOptionId: z.string().optional().nullable(),
  valueText: z.string().optional().nullable(),
  allOptions: z.boolean().optional(),
});

export type ProductAttributeInput = z.infer<typeof productAttributeInputSchema>;

export type ProductAttributeDbRow = {
  attributeId: string;
  attributeOptionId: string | null;
  valueText: string | null;
};

/**
 * Expands `allOptions` rows using the DB and merges with explicit option/text rows.
 * Deduplicates select rows by (attributeId, attributeOptionId); one text row per attributeId.
 */
export async function expandProductAttributeInput(
  prisma: PrismaClient,
  input: ProductAttributeInput[],
): Promise<ProductAttributeDbRow[]> {
  const selectKey = (a: string, o: string) => `${a}:${o}`;
  const selectRows = new Map<string, ProductAttributeDbRow>();
  const textByAttribute = new Map<string, ProductAttributeDbRow>();

  for (const pa of input) {
    if (pa.allOptions === true) {
      const attr = await prisma.attribute.findUnique({
        where: { id: pa.attributeId },
        select: {
          id: true,
          type: true,
          options: { select: { id: true }, orderBy: { sortOrder: "asc" } },
        },
      });
      if (attr?.type === "select") {
        for (const o of attr.options) {
          const k = selectKey(attr.id, o.id);
          selectRows.set(k, {
            attributeId: attr.id,
            attributeOptionId: o.id,
            valueText: null,
          });
        }
      }
      continue;
    }

    if (pa.attributeOptionId != null && pa.attributeOptionId !== "") {
      const k = selectKey(pa.attributeId, pa.attributeOptionId);
      selectRows.set(k, {
        attributeId: pa.attributeId,
        attributeOptionId: pa.attributeOptionId,
        valueText: null,
      });
      continue;
    }

    const vt = pa.valueText != null ? String(pa.valueText).trim() : "";
    if (vt) {
      textByAttribute.set(pa.attributeId, {
        attributeId: pa.attributeId,
        attributeOptionId: null,
        valueText: vt,
      });
    }
  }

  return [...selectRows.values(), ...textByAttribute.values()];
}
