"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart, type CartItem } from "@/components/storefront/cart-context";

type Props = {
  product: Omit<CartItem, "quantity">;
  quantity?: number;
  compact?: boolean;
  className?: string;
};

export function AddToCartButton({ product, quantity = 1, compact, className }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleClick() {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      size={compact ? "sm" : "default"}
      variant={outOfStock ? "secondary" : "default"}
      disabled={outOfStock}
      onClick={handleClick}
      className={cn("w-full", className)}
    >
      {outOfStock ? (
        "Out of stock"
      ) : added ? (
        <>
          <Check /> Added
        </>
      ) : (
        <>
          <ShoppingCart /> Add to cart
        </>
      )}
    </Button>
  );
}
