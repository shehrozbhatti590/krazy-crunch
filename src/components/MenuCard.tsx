"use client";

import Link from "next/link";
import { MenuItem } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";
import SpiceLevel from "./SpiceLevel";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function MenuCard({
  item,
  index = 0,
}: {
  item: MenuItem;
  index?: number;
}) {
  const { lines, addItem, increment, decrement } = useCart();
  const hasVariants = !!(item.variants && item.variants.length > 0);
  const line = !hasVariants ? lines.find((l) => l.id === item.id) : undefined;
  const qty = line?.qty ?? 0;
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: isVisible ? `${Math.min(index, 8) * 70}ms` : "0ms",
      }}
      className={`card-premium motion-card theme-card reveal ${
        isVisible ? "is-visible" : ""
      } group flex flex-col overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_28px_50px_-24px_rgba(0,0,0,0.35)]`}
    >
      <Link href={`/menu/${item.id}`} className="relative block h-44 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          style={{ backgroundImage: `url(${item.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        {item.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-mustard shadow-sm backdrop-blur-sm">
            {item.badge}
          </span>
        )}

        <span className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          {item.emoji}
        </span>

        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-ink opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          View details
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/menu/${item.id}`} className="hover:text-chili">
            <h3 className="font-display text-xl leading-tight tracking-wide text-ink">
              {item.name}
            </h3>
          </Link>
          <SpiceLevel level={item.spiceLevel ?? 0} />
        </div>

        <p className="font-body text-sm leading-6 text-ink/58">{item.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/[0.07] pt-4">
          <span className="font-display text-2xl leading-none tracking-wide text-chili">
            {hasVariants && <span className="text-sm font-body font-semibold text-ink/40">From </span>}
            {siteConfig.currency}
            {item.price.toLocaleString()}
          </span>

          {hasVariants ? (
            <Link
              href={`/menu/${item.id}`}
              className="cta-shine flex items-center gap-2 rounded-full bg-ink py-2 pl-4 pr-4 font-body text-xs font-extrabold uppercase tracking-wider text-cream shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-mustard hover:text-[#141225] hover:shadow-lg active:scale-95"
            >
              Choose Size
            </Link>
          ) : qty === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="cta-shine flex items-center gap-2 rounded-full bg-ink py-2 pl-2 pr-4 font-body text-xs font-extrabold uppercase tracking-wider text-cream shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-mustard hover:text-[#141225] hover:shadow-lg active:scale-95"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mustard text-sm leading-none text-ink transition-colors group-hover:bg-[#141225] group-hover:text-mustard">
                +
              </span>
              Add
            </button>
          ) : (
            <div className="theme-muted-card flex items-center gap-1 rounded-full bg-cream-dim p-1">
              <button
                onClick={() => decrement(item.id)}
                aria-label={`Remove one ${item.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-chili transition hover:bg-white active:scale-95"
              >
                -
              </button>
              <span className="w-5 text-center font-body text-sm font-extrabold text-ink">
                {qty}
              </span>
              <button
                onClick={() => increment(item.id)}
                aria-label={`Add one more ${item.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-chili transition hover:bg-white active:scale-95"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
