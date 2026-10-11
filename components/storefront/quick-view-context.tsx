"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { StorefrontProductCard } from "@/lib/storefront";

type QuickViewContextValue = {
  quickViewProduct: StorefrontProductCard | null;
  openQuickView: (product: StorefrontProductCard) => void;
  closeQuickView: () => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [quickViewProduct, setQuickViewProduct] = useState<StorefrontProductCard | null>(null);

  const openQuickView = useCallback((product: StorefrontProductCard) => {
    setQuickViewProduct(product);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  return (
    <QuickViewContext.Provider
      value={{ quickViewProduct, openQuickView, closeQuickView }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}

