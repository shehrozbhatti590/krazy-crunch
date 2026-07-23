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
    <div className="animate-float-up group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink/8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10">
      <div
        className={`jagged-edge relative flex h-36 items-center justify-center ${accentBg[item.accent]}`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.26)_0_25%,transparent_25%_50%,rgba(255,255,255,0.18)_50%_75%,transparent_75%)] bg-[length:30px_30px] opacity-45" />
        <span className="relative text-6xl drop-shadow-[0_8px_0_rgba(0,0,0,0.12)]" aria-hidden>
          {item.emoji}
        </span>
        {item.badge && (
          <span className="krazy-bite absolute left-3 top-3 rounded-md bg-ink px-2.5 py-1 font-body text-[10px] font-extrabold uppercase tracking-wider text-mustard">
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl leading-tight tracking-wide text-ink">
            {item.name}
          </h3>
          <SpiceLevel level={item.spiceLevel ?? 0} />
        </div>

        <p className="font-body text-sm leading-6 text-ink/62">{item.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-display text-2xl leading-none text-chili">
            {siteConfig.currency}
            {item.price.toLocaleString()}
          </span>

          {qty === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="krazy-bite rounded-xl bg-ink px-4 py-2.5 font-body text-xs font-extrabold uppercase tracking-wider text-cream transition hover:bg-chili active:scale-95"
            >
              Add +
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-xl bg-cream-dim p-1">
              <button
                onClick={() => decrement(item.id)}
                aria-label={`Remove one ${item.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-chili transition hover:bg-white active:scale-95"
              >
                -
              </button>
              <span className="w-5 text-center font-body text-sm font-extrabold text-ink">
                {qty}
              </span>
              <button
                onClick={() => increment(item.id)}
                aria-label={`Add one more ${item.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-chili transition hover:bg-white active:scale-95"
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
