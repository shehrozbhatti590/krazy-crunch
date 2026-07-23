"use client";

import { MenuItem } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";
import SpiceLevel from "./SpiceLevel";

const accentBg: Record<MenuItem["accent"], string> = {
  chili: "bg-chili",
  mustard: "bg-mustard",
  leaf: "bg-leaf",
};

export default function MenuCard({ item }: { item: MenuItem }) {
  const { lines, addItem, increment, decrement } = useCart();
  const line = lines.find((l) => l.id === item.id);
  const qty = line?.qty ?? 0;

  return (
    <div className="animate-float-up flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
      <div
        className={`jagged-edge relative flex h-32 items-center justify-center ${accentBg[item.accent]}`}
      >
        <span className="text-5xl" aria-hidden>
          {item.emoji}
        </span>
        {item.badge && (
          <span className="krazy-bite absolute left-3 top-3 rounded-lg bg-ink px-2.5 py-1 font-body text-[10px] font-extrabold uppercase tracking-wider text-cream">
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight tracking-wide text-ink">
            {item.name}
          </h3>
          <SpiceLevel level={item.spiceLevel ?? 0} />
        </div>

        <p className="font-body text-sm text-ink/60">{item.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-xl text-chili">
            {siteConfig.currency}
            {item.price.toLocaleString()}
          </span>

          {qty === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="krazy-bite rounded-xl bg-ink px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wider text-cream transition hover:bg-chili active:scale-95"
            >
              Add +
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-xl bg-cream-dim">
              <button
                onClick={() => decrement(item.id)}
                aria-label={`Remove one ${item.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-xl font-bold text-chili transition hover:bg-chili/10 active:scale-95"
              >
                −
              </button>
              <span className="w-5 text-center font-body text-sm font-bold text-ink">
                {qty}
              </span>
              <button
                onClick={() => increment(item.id)}
                aria-label={`Add one more ${item.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-xl font-bold text-chili transition hover:bg-chili/10 active:scale-95"
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
