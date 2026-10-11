"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";

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
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
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
    // storage unavailable
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

function rawAddItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    const nextQty = Math.min(existing.quantity + quantity, item.stock);
    setCart(cart.map((i) => (i.productId === item.productId ? { ...i, quantity: nextQty } : i)));
  } else {
    setCart([...cart, { ...item, quantity: Math.min(quantity, item.stock) }]);
  }
}

function rawUpdateQuantity(productId: string, quantity: number) {
  setCart(
    quantity <= 0
      ? cart.filter((i) => i.productId !== productId)
      : cart.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
        )
  );
}

function rawRemoveItem(productId: string) {
  setCart(cart.filter((i) => i.productId !== productId));
}

function rawClear() {
  setCart([]);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      rawAddItem(item, quantity);
      toast.success(`Added ${quantity > 1 ? `${quantity}x ` : ""}"${item.name}" to cart!`);
      setIsCartOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    rawUpdateQuantity(productId, quantity);
  }, []);

  const removeItem = useCallback((productId: string) => {
    rawRemoveItem(productId);
  }, []);

  const clear = useCallback(() => {
    rawClear();
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        count,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
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
