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
      <div className="animate-pop-in mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-xl">
          <span className="font-body text-xs font-extrabold uppercase tracking-[0.2em] text-chili">
            The Menu
          </span>
          <h2 className="mt-2 font-display text-5xl leading-none tracking-wide text-ink md:text-6xl">
            PICK YOUR CRUNCH
          </h2>
        </div>
        <p className="max-w-sm font-body text-sm font-medium leading-6 text-ink/60">
          Crispy deals, spicy fillets, loaded wraps and cold drinks made for
          quick orders.
        </p>
      </div>

      <div className="animate-pop-in stagger-1 mb-10 flex gap-2 overflow-x-auto rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-ink/8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`shrink-0 rounded-xl px-5 py-3 font-body text-xs font-extrabold uppercase tracking-wide transition hover:-translate-y-0.5 active:scale-95 ${
              active === cat
                ? "bg-ink text-mustard shadow-lg shadow-ink/15"
                : "text-ink/55 hover:bg-cream hover:text-ink"
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
