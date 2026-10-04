"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { Product } from "./products";
import { clampQuantity } from "./commerce";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: number | string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    selectedSize?: number | string
  ) => void;
  removeItem: (productId: number, selectedSize?: number | string) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    selectedSize?: number | string
  ) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (
    product: Product,
    quantity: number,
    selectedSize?: number | string
  ) => {
    setItems((prevItems) => {
      // Find item with same product ID AND same size
      const existingItem = prevItems.find(
        (item) =>
          item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: clampQuantity(item.quantity + quantity, product.stockQuantity) }
            : item
        );
      }
      return [...prevItems, { product, quantity: clampQuantity(quantity, product.stockQuantity), selectedSize }];
    });
  };

  const removeItem = (productId: number, selectedSize?: number | string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const updateQuantity = (
    productId: number,
    quantity: number,
    selectedSize?: number | string
  ) => {
    if (quantity <= 0) {
      removeItem(productId, selectedSize);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === productId && item.selectedSize === selectedSize
            ? { ...item, quantity: clampQuantity(quantity, item.product.stockQuantity) }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    // immediately clear persisted cart so client navigation sees empty cart
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("cart");
      }
    } catch {
      // ignore
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isLoading = !mounted;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
