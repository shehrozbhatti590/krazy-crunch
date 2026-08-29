"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CartLine, MenuItem } from "@/lib/types";
import { siteConfig } from "@/config/site";

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: MenuItem) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  buildWhatsAppUrl: (customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
    paymentMethod: string;
  }) => string;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "krazy-crunch-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setLines(JSON.parse(raw));
      } catch {
        // Ignore corrupted storage.
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore quota errors.
    }
  }, [lines, hydrated]);

  function addItem(item: MenuItem) {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.id === item.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [
        ...prev,
        { id: item.id, name: item.name, price: item.price, qty: 1, emoji: item.emoji },
      ];
    });
    setIsOpen(true);
  }

  function increment(id: string) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
    );
  }

  function decrement(id: string) {
    setLines((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function removeItem(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function clearCart() {
    setLines([]);
  }

  const totalItems = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.price, 0),
    [lines]
  );

  const deliveryFee = useMemo(() => {
    if (lines.length === 0) return 0;
    return subtotal >= siteConfig.minOrderForFreeDelivery
      ? 0
      : siteConfig.deliveryFee;
  }, [subtotal, lines.length]);

  const total = subtotal + deliveryFee;

  function buildWhatsAppUrl(customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
    paymentMethod: string;
  }) {
    const currency = siteConfig.currency;
    const itemLines = lines
      .map(
        (l) =>
          `${l.qty}x ${l.name} - ${currency}${(l.qty * l.price).toLocaleString()}`
      )
      .join("\n");

    const message = [
      `*Naya Order - ${siteConfig.name}*`,
      "",
      itemLines,
      "",
      `Subtotal: ${currency}${subtotal.toLocaleString()}`,
      deliveryFee > 0
        ? `Delivery: ${currency}${deliveryFee.toLocaleString()}`
        : `Delivery: FREE`,
      `*Total: ${currency}${total.toLocaleString()}*`,
      "",
      `Name: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Address: ${customer.address}`,
      customer.notes ? `Notes: ${customer.notes}` : "",
      `Payment: ${customer.paymentMethod}`,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
  }

  return (
    <CartContext.Provider
      value={{
        lines,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        increment,
        decrement,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        total,
        buildWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
