export type MenuCategory = string;

export interface MenuVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  spiceLevel?: 0 | 1 | 2 | 3;
  badge?: string;
  emoji: string;
  image: string;
  accent: "chili" | "mustard" | "leaf";
  variants?: MenuVariant[] | null;
}

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}
