"use client";

import { useMemo, useState } from "react";
import { categories, menuItems } from "@/data/menu";
import { MenuCategory } from "@/lib/types";
import MenuCard from "./MenuCard";

export default function MenuSection() {
  const [active, setActive] = useState<MenuCategory>("Deals");

  const items = useMemo(
    () => menuItems.filter((item) => item.category === active),
    [active]
  );

  return (
    <section id="menu" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-10 max-w-xl">
        <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-chili">
          The Menu
        </span>
        <h2 className="mt-2 font-display text-4xl tracking-wide text-ink md:text-5xl">
          PICK YOUR CRUNCH
        </h2>
      </div>

      <div className="mb-10 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`shrink-0 rounded-full px-5 py-2.5 font-body text-sm font-bold uppercase tracking-wide transition ${
              active === cat
                ? "bg-ink text-cream"
                : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
