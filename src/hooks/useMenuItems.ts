"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { DbMenuItem } from "@/lib/menu-types";

/**
 * Fetches menu items from Supabase and keeps them live-synced via realtime.
 * Pass includeInactive=true for the admin panel; the customer site and POS
 * should leave it false so hidden/86'd items never show up.
 */
export function useMenuItems(includeInactive = false) {
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    let query = supabase.from("menu_items").select("*").order("sort_order", { ascending: true });
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }
    const { data, error } = await query;
    if (!error && data) {
      setItems(data as DbMenuItem[]);
    }
    setLoading(false);
  }, [includeInactive]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const channel = supabase
      .channel("menu-items-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    items.forEach((item) => {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        ordered.push(item.category);
      }
    });
    return ordered;
  }, [items]);

  return { items, categories, loading, refetch: fetchItems };
}
