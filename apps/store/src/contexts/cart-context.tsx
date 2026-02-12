"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product, ProductVariant } from "@/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, selectedVariant?: ProductVariant | null) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "fs-eshop-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      setItems(JSON.parse(stored) as CartItem[]);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (product: Product, selectedVariant?: ProductVariant | null) => {
    const variantId = selectedVariant?.id ?? null;
    const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          (item.selectedVariant?.id ?? null) === variantId
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && (item.selectedVariant?.id ?? null) === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          price: effectivePrice,
          quantity: 1,
          selectedVariant: selectedVariant ?? undefined,
        },
      ];
    });
  };

  const removeItem = (productId: string, variantId?: string | null) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.id === productId && (item.selectedVariant?.id ?? null) === (variantId ?? null))
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    variantId?: string | null
  ) => {
    const safeQuantity = Math.max(1, quantity);
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId && (item.selectedVariant?.id ?? null) === (variantId ?? null)
          ? { ...item, quantity: safeQuantity }
          : item
      )
    );
  };

  const clear = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
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
      subtotal
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

