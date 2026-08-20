"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import MenuCard from "./MenuCard";
import type { DbMenuItem } from "@/lib/menu-types";

function toCardItem(item: DbMenuItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    spiceLevel: item.spice_level as 0 | 1 | 2 | 3,
    badge: item.badge ?? undefined,
    emoji: item.emoji,
    image: item.image_url,
    accent: item.accent,
  };
}

export default function MenuSection() {
  const { items: dbItems, categories, loading } = useMenuItems(false);
  const [active, setActive] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isClickScrolling = useRef(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemsByCategory = useMemo(() => {
    const map: Record<string, DbMenuItem[]> = {};
    categories.forEach((cat) => {
      map[cat] = dbItems.filter((item) => item.category === cat);
    });
    return map;
  }, [dbItems, categories]);

  useEffect(() => {
    if (!active && categories.length > 0) {
      setActive(categories[0]);
    }
  }, [active, categories]);

  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const cat = visible[0].target.getAttribute("data-category");
          if (cat) setActive(cat);
        }
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.1] }
    );

    categories.forEach((cat) => {
      const el = sectionRefs.current[cat];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  function goToCategory(cat: string) {
    setActive(cat);
    isClickScrolling.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    const el = sectionRefs.current[cat];
    if (el) {
      const offset = 132;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }

    clickTimeoutRef.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  }

  return (
    <section
      id="menu"
      className="relative mx-auto max-w-6xl overflow-hidden px-5 py-16 md:px-8 md:py-24"
    >
      <div
        aria-hidden
        className="menu-bg-photo"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1636907229111-a8ac768fe6c9?auto=format&fit=crop&w=800&q=40)",
        }}
      />
      <div aria-hidden className="menu-bg-overlay" />

      <div className="relative">
        <div className="animate-pop-in mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="font-body text-xs font-extrabold uppercase tracking-[0.25em] text-chili">
              The Menu
            </span>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-wide text-ink md:text-6xl">
              PICK YOUR CRUNCH
            </h2>
            <div className="mt-4 h-[3px] w-16 rounded-full bg-mustard" />
          </div>
          <p className="max-w-sm font-body text-sm font-medium leading-6 text-ink/55">
            Crispy deals, spicy fillets, loaded wraps and cold drinks made for
            quick orders.
          </p>
        </div>

        <div className="sticky top-14 z-20 -mx-1 mb-2 flex gap-1.5 overflow-x-auto rounded-full border border-ink/[0.06] bg-white/90 p-1.5 shadow-md backdrop-blur-md sm:top-16 md:top-[72px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => goToCategory(cat)}
              className={`shrink-0 rounded-full px-5 py-2.5 font-body text-xs font-extrabold uppercase tracking-wide transition-all duration-300 active:scale-95 ${
                active === cat
                  ? "bg-ink text-mustard shadow-md"
                  : "text-ink/50 hover:bg-ink/[0.05] hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-10 text-center font-body text-sm text-ink/40">Loading menu...</p>
        ) : categories.length === 0 ? (
          <p className="py-10 text-center font-body text-sm text-ink/40">
            No menu items yet.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-14">
            {categories.map((cat) => (
              <div
                key={cat}
                data-category={cat}
                ref={(el) => {
                  sectionRefs.current[cat] = el;
                }}
                className="scroll-mt-32"
              >
                <h3 className="mb-5 font-display text-2xl tracking-wide text-ink md:text-3xl">
                  {cat}
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {itemsByCategory[cat].map((item, index) => (
                    <MenuCard key={item.id} item={toCardItem(item)} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
