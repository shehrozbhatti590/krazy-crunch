"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";

const navLinks = [
  { label: "Menu", href: "#menu" },
  { label: "Why Us", href: "#why-us" },
  { label: "Location", href: "#location" },
];

type Theme = "light" | "dark";

export default function Header() {
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const activeTheme =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(activeTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("krazy-crunch-theme", nextTheme);
  }

  return (
    <header
      className={`theme-dark-header sticky top-0 z-40 border-b border-cream/10 transition-all ${
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
              className="rounded-full px-4 py-2 font-body text-xs font-extrabold uppercase tracking-[0.16em] text-cream/75 transition hover:-translate-y-0.5 hover:bg-cream/10 hover:text-mustard"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="group flex h-12 items-center gap-1 rounded-full border border-cream/15 bg-cream/8 p-1 text-cream shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-mustard/50 hover:bg-cream/12 active:scale-95"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                theme === "light"
                  ? "bg-mustard text-[#17110d] shadow-md shadow-mustard/25"
                  : "text-cream/55"
              }`}
              aria-hidden
            >
              {"\u2600"}
            </span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                theme === "dark"
                  ? "bg-mustard text-[#17110d] shadow-md shadow-mustard/25"
                  : "text-cream/55"
              }`}
              aria-hidden
            >
              {"\u263E"}
            </span>
          </button>

          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-shine hidden items-center gap-2 rounded-full border border-mustard/40 bg-mustard/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-mustard transition hover:-translate-y-0.5 hover:bg-mustard hover:text-ink sm:flex"
          >
            <span aria-hidden>{"\u{1F4AC}"}</span> {siteConfig.phoneDisplay}
          </a>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="theme-control group relative flex h-12 items-center gap-2 rounded-full border border-mustard/45 bg-cream px-2.5 pr-4 text-ink shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-mustard hover:bg-mustard active:scale-95"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-chili text-base text-[#fff5df] shadow-md shadow-chili/30 transition group-hover:rotate-[-8deg] group-hover:bg-[#17110d]">
              <span aria-hidden>{"\u{1F6D2}"}</span>
            </span>
            <span className="hidden font-body text-xs font-extrabold uppercase tracking-[0.12em] sm:inline">
              Cart
            </span>
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#fff5df] bg-chili px-1.5 text-[11px] font-extrabold leading-none text-[#fff5df] shadow-md shadow-black/20">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
