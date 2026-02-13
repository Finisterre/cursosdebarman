"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types";

type CartEntry = CartItem & { name?: string; image_url?: string | null };

type CartContextValue = {
  items: CartEntry[];
  addItem: (item: CartItem & { name?: string; image_url?: string | null }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "fs-eshop-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartEntry[]>([]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartEntry[];
        setItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (entry: CartItem & { name?: string; image_url?: string | null }) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === entry.productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === entry.productId
            ? { ...item, quantity: item.quantity + entry.quantity, name: entry.name ?? item.name, image_url: entry.image_url ?? item.image_url }
            : item
        );
      }
      return [...prev, { ...entry, name: entry.name, image_url: entry.image_url }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const safeQuantity = Math.max(1, quantity);
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: safeQuantity } : item
      )
    );
  };

  const clear = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      totalItems,
      subtotal,
    }),
    [items, totalItems, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
