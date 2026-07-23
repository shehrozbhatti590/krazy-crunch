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
      className={`sticky top-0 z-40 transition-colors ${
        scrolled ? "bg-ink shadow-lg shadow-black/20" : "bg-ink"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-wide text-cream md:text-3xl">
            KRAZY<span className="text-mustard">CRUNCH</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm font-semibold uppercase tracking-wider text-cream/80 transition hover:text-mustard"
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
            className="hidden items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream/90 transition hover:border-mustard hover:text-mustard sm:flex"
          >
            <span aria-hidden>💬</span> {siteConfig.phoneDisplay}
          </a>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="krazy-bite relative flex h-11 w-11 items-center justify-center rounded-2xl bg-chili text-cream transition hover:bg-chili-dark active:scale-95"
          >
            <span className="text-lg" aria-hidden>
              🛒
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
