"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import SpiceLevel from "@/components/SpiceLevel";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import type { DbMenuItem } from "@/lib/menu-types";
import type { MenuItem } from "@/lib/types";

function toCardItem(item: DbMenuItem): MenuItem {
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
    variants: item.variants,
  };
}

export default function MenuItemDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [item, setItem] = useState<DbMenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const { lines, addItem, increment, decrement } = useCart();

  useEffect(() => {
    if (!id) return;
    let active = true;
    supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (!data) {
          setNotFound(true);
        } else {
          setItem(data as DbMenuItem);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const cardItem = item ? toCardItem(item) : null;
  const hasVariants = !!(cardItem?.variants && cardItem.variants.length > 0);

  const activeVariant = useMemo(() => {
    if (!hasVariants || !cardItem?.variants) return null;
    return cardItem.variants[selectedVariantIndex] ?? cardItem.variants[0];
  }, [hasVariants, cardItem, selectedVariantIndex]);

  const cartLineId = hasVariants && activeVariant ? `${cardItem!.id}::${activeVariant.label}` : cardItem?.id;
  const cartLineName =
    hasVariants && activeVariant ? `${cardItem!.name} (${activeVariant.label})` : cardItem?.name ?? "";
  const displayPrice = hasVariants && activeVariant ? activeVariant.price : cardItem?.price ?? 0;

  const line = cartLineId ? lines.find((l) => l.id === cartLineId) : undefined;
  const qty = line?.qty ?? 0;

  function handleAdd() {
    if (!cardItem) return;
    if (hasVariants && activeVariant) {
      addItem({
        ...cardItem,
        id: cartLineId!,
        name: cartLineName,
        price: activeVariant.price,
      });
    } else {
      addItem(cardItem);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-16">
          <Link
            href="/#menu"
            className="inline-flex items-center gap-1.5 font-body text-xs font-extrabold uppercase tracking-wide text-ink/50 transition hover:text-chili"
          >
            {"\u2190"} Back to menu
          </Link>

          {loading ? (
            <p className="mt-10 font-body text-sm text-ink/40">Loading...</p>
          ) : notFound || !cardItem ? (
            <div className="mt-10">
              <p className="font-body text-sm text-ink/50">
                This item isn&apos;t available right now.
              </p>
              <Link
                href="/#menu"
                className="mt-4 inline-block rounded-xl bg-ink px-6 py-3 font-body text-xs font-extrabold uppercase tracking-wider text-cream transition hover:bg-chili"
              >
                Browse the menu
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
              <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg md:h-full md:min-h-[420px]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${cardItem.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {cardItem.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-mustard shadow-sm backdrop-blur-sm">
                    {cardItem.badge}
                  </span>
                )}
                <span className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-3xl shadow-lg backdrop-blur-sm">
                  {cardItem.emoji}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-body text-xs font-extrabold uppercase tracking-[0.2em] text-chili">
                  {cardItem.category}
                </span>
                <h1 className="mt-2 font-display text-4xl leading-[0.95] tracking-wide text-ink md:text-5xl">
                  {cardItem.name}
                </h1>

                <div className="mt-4 flex items-center gap-4">
                  <span className="font-display text-3xl leading-none text-chili">
                    {siteConfig.currency}
                    {displayPrice.toLocaleString()}
                  </span>
                  <SpiceLevel level={cardItem.spiceLevel ?? 0} />
                </div>

                <p className="mt-5 font-body text-base leading-7 text-ink/65">
                  {cardItem.description}
                </p>

                {hasVariants && cardItem.variants && (
                  <div className="mt-6">
                    <p className="mb-2 font-body text-xs font-extrabold uppercase tracking-wide text-ink/50">
                      Choose Size
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {cardItem.variants.map((v, i) => (
                        <button
                          key={v.label}
                          onClick={() => setSelectedVariantIndex(i)}
                          className={`rounded-xl border p-3 text-left transition ${
                            i === selectedVariantIndex
                              ? "border-chili bg-chili/5 shadow-sm"
                              : "border-ink/10 hover:border-ink/25"
                          }`}
                        >
                          <p className="font-body text-xs font-bold text-ink">{v.label}</p>
                          <p className="font-display text-lg leading-none text-chili">
                            {siteConfig.currency}
                            {v.price.toLocaleString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-8">
                  {qty === 0 ? (
                    <button
                      onClick={handleAdd}
                      className="cta-shine flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-4 font-body text-sm font-extrabold uppercase tracking-wider text-cream shadow-lg transition hover:-translate-y-0.5 hover:bg-mustard hover:text-[#141225] active:scale-95 md:w-auto md:px-10"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mustard text-base leading-none text-ink">
                        +
                      </span>
                      Add to Cart
                    </button>
                  ) : (
                    <div className="theme-muted-card flex w-full items-center justify-between gap-3 rounded-xl bg-cream-dim p-2 md:w-auto">
                      <button
                        onClick={() => decrement(cartLineId!)}
                        aria-label={`Remove one ${cartLineName}`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-chili transition hover:bg-white active:scale-95"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center font-display text-2xl text-ink">
                        {qty}
                      </span>
                      <button
                        onClick={() => increment(cartLineId!)}
                        aria-label={`Add one more ${cartLineName}`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-chili transition hover:bg-white active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloatingButton />
    </>
  );
}
