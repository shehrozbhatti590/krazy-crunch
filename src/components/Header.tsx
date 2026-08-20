"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";
import SettingsMenu, { SettingsInline } from "./SettingsMenu";

const navLinks = [
  { label: "Menu", href: "#menu", icon: "\u{1F357}" },
  { label: "Why Us", href: "#why-us", icon: "\u2B50" },
  { label: "Location", href: "#location", icon: "\u{1F4CD}" },
];

export default function Header() {
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const prevTotal = useRef(totalItems);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (totalItems > prevTotal.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 520);
      prevTotal.current = totalItems;
      return () => clearTimeout(t);
    }
    prevTotal.current = totalItems;
  }, [totalItems]);

  return (
    <header
      className={`header-enter sticky top-0 z-40 border-b border-[#f5f4fb]/10 transition-all ${
        scrolled ? "header-surface-scrolled shadow-xl shadow-black/20" : "header-surface"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1.5 px-3 py-3 sm:gap-2 sm:px-5 md:px-8">
        <a href="#top" className="group flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="flame-icon shrink-0 text-base sm:text-xl" aria-hidden>
            {"\u{1F525}"}
          </span>
          <span className="truncate font-display text-lg leading-none tracking-wide text-[#f5f4fb] transition-all duration-300 group-hover:tracking-wider sm:text-2xl md:text-3xl">
            KRAZY<span className="text-mustard">CRUNCH</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full bg-[#f5f4fb]/8 p-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link flex items-center gap-1.5 rounded-full px-4 py-2 font-body text-xs font-extrabold uppercase tracking-[0.14em] text-[#f5f4fb]/75 transition hover:-translate-y-0.5 hover:bg-[#f5f4fb]/10 hover:text-mustard"
            >
              <span aria-hidden className="text-sm">
                {link.icon}
              </span>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <div className="hidden md:block">
            <SettingsMenu />
          </div>

          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-shine hidden items-center gap-2 rounded-full border border-mustard/40 bg-mustard/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-mustard transition hover:-translate-y-0.5 hover:bg-mustard hover:text-[#141225] lg:flex"
          >
            <span aria-hidden>{"\u{1F4AC}"}</span> {siteConfig.phoneDisplay}
          </a>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className={`theme-control group relative flex h-9 items-center gap-1.5 rounded-full border border-mustard/45 bg-cream px-2 text-ink shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-mustard hover:bg-mustard active:scale-95 sm:h-11 sm:gap-2 sm:px-2.5 sm:pr-4 ${
              cartBounce ? "cart-bounce" : ""
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-chili text-xs text-[#fff5df] shadow-md shadow-chili/30 transition group-hover:rotate-[-8deg] group-hover:bg-[#17110d] sm:h-8 sm:w-8 sm:text-base">
              <span aria-hidden>{"\u{1F6D2}"}</span>
            </span>
            <span className="hidden font-body text-xs font-extrabold uppercase tracking-[0.12em] sm:inline">
              Cart
            </span>
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#fff5df] bg-chili px-1 text-[10px] font-extrabold leading-none text-[#fff5df] shadow-md shadow-black/20 sm:-right-2 sm:-top-2 sm:h-6 sm:min-w-6 sm:px-1.5 sm:text-[11px]">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className={`relative flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-[5px] rounded-full border transition active:scale-95 sm:h-11 sm:w-11 sm:gap-1.5 md:hidden ${
              mobileOpen
                ? "border-mustard bg-mustard"
                : "border-[#f5f4fb]/25 bg-[#f5f4fb]/12 hover:border-mustard/60 hover:bg-[#f5f4fb]/18"
            }`}
          >
            <span
              className={`h-[2.5px] w-4 rounded-full transition-all duration-300 sm:w-5 ${
                mobileOpen ? "translate-y-[7px] rotate-45 bg-[#17110d]" : "bg-[#f5f4fb]"
              }`}
            />
            <span
              className={`h-[2.5px] w-4 rounded-full transition-all duration-300 sm:w-5 ${
                mobileOpen ? "opacity-0" : "bg-[#f5f4fb]"
              }`}
            />
            <span
              className={`h-[2.5px] w-4 rounded-full transition-all duration-300 sm:w-5 ${
                mobileOpen ? "-translate-y-[7px] -rotate-45 bg-[#17110d]" : "bg-[#f5f4fb]"
              }`}
            />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav-panel w-full max-w-full overflow-x-hidden border-t border-[#f5f4fb]/10 bg-[#0b0a0f] px-4 py-4 sm:px-5 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm font-extrabold uppercase tracking-wide text-[#f5f4fb]/80 transition hover:bg-[#f5f4fb]/10 hover:text-mustard"
              >
                <span aria-hidden>{link.icon}</span>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-3">
            <p className="mb-2 px-1 font-body text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f5f4fb]/45">
              Settings
            </p>
            <SettingsInline />
          </div>

          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-shine mt-3 flex items-center justify-center gap-2 rounded-full border border-mustard/40 bg-mustard/10 px-4 py-3 font-body text-xs font-extrabold uppercase tracking-wider text-mustard transition hover:bg-mustard hover:text-[#141225]"
          >
            <span aria-hidden>{"\u{1F4AC}"}</span> {siteConfig.phoneDisplay}
          </a>
        </div>
      )}
    </header>
  );
}
