"use client";

import { useState } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { supabase } from "@/lib/supabase";
import { logoutAdmin } from "./actions";
import MenuItemForm from "@/components/admin/MenuItemForm";
import type { DbMenuItem, MenuItemInput } from "@/lib/menu-types";

export default function AdminPage() {
  const { items, categories, loading, refetch } = useMenuItems(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DbMenuItem | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  function openAdd() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: DbMenuItem) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleSave(input: MenuItemInput) {
    if (editingItem) {
      await supabase.from("menu_items").update(input).eq("id", editingItem.id);
    } else {
      await supabase.from("menu_items").insert(input);
    }
    setFormOpen(false);
    setEditingItem(null);
    refetch();
  }

  async function toggleActive(item: DbMenuItem) {
    await supabase.from("menu_items").update({ is_active: !item.is_active }).eq("id", item.id);
    refetch();
  }

  async function deleteItem(item: DbMenuItem) {
    if (!confirm(`Delete "${item.name}" permanently? This cannot be undone.`)) return;
    await supabase.from("menu_items").delete().eq("id", item.id);
    refetch();
  }

  const visibleItems =
    activeCategoryFilter === "all"
      ? items
      : items.filter((i) => i.category === activeCategoryFilter);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#f5f4fb]/10 bg-[#0e0c12]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {"\u{1F525}"}
            </span>
            <span className="font-display text-xl tracking-wide text-[#f5f4fb]">
              KRAZY<span className="text-mustard">CRUNCH</span>
              <span className="ml-2 rounded-full bg-mustard/15 px-2 py-0.5 align-middle font-body text-[10px] font-extrabold uppercase tracking-wider text-mustard">
                Admin
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/pos"
              className="rounded-full border border-[#f5f4fb]/15 bg-[#f5f4fb]/8 px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide text-[#f5f4fb]/70 transition hover:border-mustard/50"
            >
              Open POS
            </a>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-full border border-[#f5f4fb]/15 bg-[#f5f4fb]/8 px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide text-[#f5f4fb]/70 transition hover:border-chili/50 hover:text-chili"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl tracking-wide text-[#f5f4fb]">Menu Management</h1>
          <button
            onClick={openAdd}
            className="cta-shine rounded-xl bg-mustard px-5 py-3 font-body text-sm font-extrabold uppercase tracking-wider text-[#17110d] transition hover:brightness-95 active:scale-95"
          >
            + Add New Item
          </button>
        </div>

        <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-full border border-[#f5f4fb]/10 bg-[#14111a] p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveCategoryFilter("all")}
            className={`shrink-0 rounded-full px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide transition ${
              activeCategoryFilter === "all"
                ? "bg-mustard text-[#17110d]"
                : "text-[#f5f4fb]/55 hover:bg-[#f5f4fb]/10"
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`shrink-0 rounded-full px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide transition ${
                activeCategoryFilter === cat
                  ? "bg-mustard text-[#17110d]"
                  : "text-[#f5f4fb]/55 hover:bg-[#f5f4fb]/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-6 font-body text-sm text-[#f5f4fb]/40">Loading menu...</p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className={`overflow-hidden rounded-xl border transition ${
                  item.is_active
                    ? "border-[#f5f4fb]/10 bg-[#14111a]"
                    : "border-[#f5f4fb]/5 bg-[#14111a]/40 opacity-60"
                }`}
              >
                <div className="relative h-28 w-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image_url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xl" aria-hidden>
                    {item.emoji}
                  </span>
                  {item.badge && (
                    <span className="absolute right-2 top-2 rounded-full bg-mustard/90 px-2 py-0.5 font-body text-[9px] font-extrabold uppercase tracking-wide text-[#17110d]">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 p-4">
                  <div>
                    <p className="font-body text-sm font-bold text-[#f5f4fb]">{item.name}</p>
                    <p className="mt-0.5 line-clamp-2 font-body text-xs text-[#f5f4fb]/45">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg leading-none text-mustard">
                      Rs.{item.price.toLocaleString()}
                    </span>
                    <span className="font-body text-[10px] font-bold uppercase text-[#f5f4fb]/35">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 border-t border-[#f5f4fb]/10 pt-2.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex-1 rounded-lg bg-[#f5f4fb]/8 py-1.5 font-body text-[11px] font-bold uppercase text-[#f5f4fb]/70 transition hover:bg-[#f5f4fb]/15"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(item)}
                      className={`flex-1 rounded-lg py-1.5 font-body text-[11px] font-bold uppercase transition ${
                        item.is_active
                          ? "bg-leaf/15 text-leaf hover:bg-leaf/25"
                          : "bg-[#f5f4fb]/8 text-[#f5f4fb]/50 hover:bg-[#f5f4fb]/15"
                      }`}
                    >
                      {item.is_active ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => deleteItem(item)}
                      className="flex-1 rounded-lg bg-chili/10 py-1.5 font-body text-[11px] font-bold uppercase text-chili/80 transition hover:bg-chili/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {formOpen && (
        <MenuItemForm
          item={editingItem}
          categories={categories}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </>
  );
}
