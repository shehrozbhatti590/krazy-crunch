"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { categories, menuItems } from "@/data/menu";
import { MenuCategory } from "@/lib/types";
import MenuCard from "./MenuCard";

const AUTOPLAY_MS = 4000;

export default function MenuSection() {
  const [active, setActive] = useState<MenuCategory>("Deals");
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = useMemo(
    () => menuItems.filter((item) => item.category === active),
    [active]
  );

  const scrollByCards = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-menu-card]");
    const gap = 20;
    const cardWidth = card ? card.offsetWidth + gap : track.clientWidth * 0.85;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const next = track.scrollLeft + direction * cardWidth;

    if (next < 4) {
      track.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else if (next > maxScroll - 4) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    }
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => scrollByCards(1), AUTOPLAY_MS);
  };

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, items.length]);

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
        <div className="animate-pop-in mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
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

        <div className="animate-pop-in stagger-1 mb-10 flex gap-1.5 overflow-x-auto rounded-full border border-ink/[0.06] bg-white/70 p-1.5 shadow-sm backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
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

        <div className="relative px-1 md:px-2">
          <div
            ref={trackRef}
            onMouseEnter={stopAutoplay}
            onMouseLeave={startAutoplay}
            className="menu-carousel flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                data-menu-card
                className="menu-carousel-item w-[82%] shrink-0 sm:w-[46%] lg:w-[31.5%]"
              >
                <MenuCard item={item} index={index} />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Previous items"
            onClick={() => {
              scrollByCards(-1);
              startAutoplay();
            }}
            className="menu-arrow menu-arrow-left"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next items"
            onClick={() => {
              scrollByCards(1);
              startAutoplay();
            }}
            className="menu-arrow menu-arrow-right"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}