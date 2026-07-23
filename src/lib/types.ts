export type MenuCategory =
  | "Deals"
  | "Fried Chicken"
  | "Burgers"
  | "Wraps & Rolls"
  | "Sides"
  | "Beverages";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  spiceLevel?: 0 | 1 | 2 | 3;
  badge?: "Bestseller" | "New" | "Krazy Special";
  emoji: string;
  accent: "chili" | "mustard" | "leaf";
}

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}
