"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";

const navLinks = [
  { label: "Menu", href: "#menu" },
  { label: "Why Us", href: "#why-us" },
  { label: "Location", href: "#location" },
];

export default function Header() {
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-cream/10 transition-all ${
        scrolled
          ? "bg-ink/95 shadow-xl shadow-black/20 backdrop-blur"
          : "bg-ink"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <span className="font-display text-2xl leading-none tracking-wide text-cream md:text-3xl">
            KRAZY<span className="text-mustard">CRUNCH</span>
          </span>
        </a>

        <nav className="hidden items-center gap-2 rounded-full bg-cream/8 p-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 font-body text-xs font-extrabold uppercase tracking-[0.16em] text-cream/75 transition hover:bg-cream/10 hover:text-mustard"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-mustard/40 bg-mustard/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-mustard transition hover:bg-mustard hover:text-ink sm:flex"
          >
            <span aria-hidden>{"\u{1F4AC}"}</span> {siteConfig.phoneDisplay}
          </a>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="krazy-bite relative flex h-11 w-11 items-center justify-center rounded-xl bg-chili text-cream shadow-lg shadow-chili/30 transition hover:bg-chili-dark active:scale-95"
          >
            <span className="text-lg" aria-hidden>
              {"\u{1F6D2}"}
            </span>
            {totalItems > 0 && (
              <span className="absolute -bottom-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-mustard px-1 text-[11px] font-extrabold text-ink">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
