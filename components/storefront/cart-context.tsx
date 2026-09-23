"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "storefront-cart";
const EMPTY_CART: CartItem[] = [];

const listeners = new Set<() => void>();
let cart: CartItem[] = EMPTY_CART;
let initialized = false;

function readFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode, quota, etc.) — cart stays in-memory
  }
}

function setCart(next: CartItem[]) {
  cart = next;
  writeToStorage(next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!initialized) {
    cart = readFromStorage();
    initialized = true;
  }
  return cart;
}

function getServerSnapshot() {
  return EMPTY_CART;
}

function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    const nextQty = Math.min(existing.quantity + quantity, item.stock);
    setCart(cart.map((i) => (i.productId === item.productId ? { ...i, quantity: nextQty } : i)));
  } else {
    setCart([...cart, { ...item, quantity: Math.min(quantity, item.stock) }]);
  }
}

function updateQuantity(productId: string, quantity: number) {
  setCart(
    quantity <= 0
      ? cart.filter((i) => i.productId !== productId)
      : cart.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
        )
  );
}

function removeItem(productId: string) {
  setCart(cart.filter((i) => i.productId !== productId));
}

function clear() {
  setCart([]);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clear, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
