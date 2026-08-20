export type MenuCategory = string;

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
}

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}
