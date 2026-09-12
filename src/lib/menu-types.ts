export type MenuAccent = "chili" | "mustard" | "leaf";

export interface MenuVariant {
  label: string;
  price: number;
}

export interface DbMenuItem {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  image_url: string;
  accent: MenuAccent;
  badge: string | null;
  spice_level: number;
  is_active: boolean;
  sort_order: number;
  variants: MenuVariant[] | null;
}

export type MenuItemInput = Omit<DbMenuItem, "id" | "created_at" | "updated_at">;
