"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=1400&q=60",
    alt: "Crispy fried chicken wings",
  },
  {
    image:
      "https://images.unsplash.com/photo-1636907229111-a8ac768fe6c9?auto=format&fit=crop&w=1400&q=60",
    alt: "Loaded cheeseburger with fries",
  },
  {
    image:
      "https://images.unsplash.com/photo-1737816150985-a7d41389f502?auto=format&fit=crop&w=1400&q=60",
    alt: "Spicy chicken wings and fries",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoaded((prev) => (prev.has(active) ? prev : new Set(prev).add(active)));
  }, [active]);

  return (
    <section id="top" className="theme-dark-section relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        {slides.map((slide, i) => (
          <div key={slide.image} className={`hero-slide ${i === active ? "is-active" : ""}`}>
            <div
              className="hero-slide-img"
              style={loaded.has(i) ? { backgroundImage: `url(${slide.image})` } : undefined}
            />
          </div>
        ))}
        <div className="hero-scrim" />
        <div className="hero-glow" />
      </div>

      <div className="absolute bottom-8 right-5 flex gap-2 md:right-8">
        {slides.map((slide, i) => (
          <button
            key={slide.image}
            onClick={() => setActive(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`hero-slide-dot h-2 rounded-full transition-all ${
              i === active ? "w-7" : "w-2"
            }`}
            style={{
              backgroundColor: i === active ? "var(--color-mustard)" : "rgba(242,233,216,0.35)",
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-start px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-20">
        <span className="hero-badge animate-pop-in mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-body text-xs font-extrabold uppercase tracking-[0.18em]">
          <span aria-hidden>{"\u{1F525}"}</span> Fresh oil daily - {siteConfig.city}
        </span>

        <h1 className="hero-heading animate-pop-in stagger-1 max-w-5xl font-display text-[16vw] leading-[0.82] tracking-wide sm:text-7xl md:text-8xl lg:text-[7.8rem]">
          CRUNCH SO
          <br />
          LOUD, THE{" "}
          <span className="hero-heading-accent">
            NEIGHBOURS
          </span>
          <br />
          WILL ASK.
        </h1>

        <p className="hero-subtext animate-pop-in stagger-2 mt-6 max-w-xl font-body text-base font-medium leading-7 md:text-lg">
          {siteConfig.tagline} Double-fried chicken, loaded burgers and
          krazy-hot deals - ordered in two taps, confirmed on WhatsApp,
          delivered hot.
        </p>

        <div className="animate-pop-in stagger-3 mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#menu"
            className="cta-shine rounded-xl bg-mustard px-7 py-4 font-body text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-mustard/25 transition hover:-translate-y-0.5 hover:bg-mustard-dark active:scale-95"
          >
            View Full Menu
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
              "Hi Krazy Crunch! I would like to place an order."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-outline-btn cta-shine flex items-center gap-2 rounded-xl px-7 py-4 font-body text-sm font-extrabold uppercase tracking-wider transition hover:-translate-y-0.5"
          >
            <span aria-hidden>{"\u{1F4AC}"}</span> Order on WhatsApp
          </a>
        </div>

        <div className="animate-pop-in stagger-4 mt-14 grid w-full max-w-2xl grid-cols-3 gap-3">
          {[
            ["15 min", "average fire time"],
            ["3 levels", "of Krazy spice"],
            ["4.8*", "customer rating"],
          ].map(([stat, label], i) => (
            <div
              key={label}
              className="hero-stat-card rounded-xl p-3 transition hover:-translate-y-1"
              style={{ animationDelay: `${0.32 + i * 0.08}s` }}
            >
              <p className="hero-heading font-display text-2xl leading-none text-mustard md:text-3xl">
                {stat}
              </p>
              <p className="hero-subtext mt-1 font-body text-[10px] font-bold uppercase tracking-wider md:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="jagged-edge h-6 w-full bg-cream md:h-8" />
    </section>
  );
}