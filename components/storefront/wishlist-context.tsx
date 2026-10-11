"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

type WishlistContextType = {
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "storefront_wishlist_ids";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage initially
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync with API if user is authenticated
  const fetchRemoteWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/storefront/wishlist");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.productIds) && data.productIds.length > 0) {
          setWishlistIds((prev) => {
            const merged = Array.from(new Set([...prev, ...data.productIds]));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch {
      // Guest or offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRemoteWishlist();
  }, [fetchRemoteWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string, productName?: string) => {
      const alreadyIn = wishlistIds.includes(productId);
      const updated = alreadyIn
        ? wishlistIds.filter((id) => id !== productId)
        : [...wishlistIds, productId];

      setWishlistIds(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      if (alreadyIn) {
        toast(productName ? `Removed "${productName}" from wishlist` : "Removed from wishlist", {
          icon: "💔",
        });
      } else {
        toast.success(productName ? `Added "${productName}" to wishlist!` : "Added to wishlist!", {
          icon: "❤️",
        });
      }

      // Try syncing with server
      try {
        await fetch("/api/storefront/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } catch {
        // Guest mode fallback
      }
    },
    [wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isInWishlist,
        toggleWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}

