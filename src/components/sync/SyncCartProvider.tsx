"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  planId: string;
  productId: string;
  productName: string;
  productSlug: string;
  planTitle: string;
  priceUsd: number;
  originalPriceUsd: number | null;
  durationDays: number;
  quantity: number;
  coverImageUrl: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (planId: string) => void;
  updateQuantity: (planId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalUsd: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "sync-cart";

export function SyncCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.planId === item.planId);
      if (existing) {
        return prev.map(i => i.planId === item.planId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((planId: string) => {
    setItems(prev => prev.filter(i => i.planId !== planId));
  }, []);

  const updateQuantity = useCallback((planId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.planId !== planId));
    } else {
      setItems(prev => prev.map(i => i.planId === planId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalUsd = items.reduce((sum, i) => sum + i.priceUsd * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalUsd, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useSyncCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useSyncCart must be used within SyncCartProvider");
  return context;
}
