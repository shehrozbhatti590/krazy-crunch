"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";

export default function CartDrawer() {
  const {
    lines,
    isOpen,
    closeCart,
    increment,
    decrement,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    buildWhatsAppUrl,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [touched, setTouched] = useState(false);

  const canCheckout = lines.length > 0 && name.trim() && phone.trim() && address.trim();

  function handleCheckout() {
    setTouched(true);
    if (!canCheckout) return;
    const url = buildWhatsAppUrl({ name, phone, address, notes, paymentMethod });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      {/* backdrop */}
      <div
        onClick={closeCart}
        aria-hidden
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* drawer */}
      <aside
        role="dialog"
        aria-label="Your cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 bg-ink px-5 py-4">
          <h2 className="font-display text-2xl tracking-wide text-cream">
            YOUR CART
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cream/80 transition hover:bg-cream/10 hover:text-cream"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="text-4xl" aria-hidden>
                🛒
              </span>
              <p className="font-body text-sm text-ink/50">
                Cart khaali hai. Menu se kuch krazy add karein!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-ink/5"
                >
                  <span className="text-2xl" aria-hidden>
                    {line.emoji}
                  </span>
                  <div className="flex-1">
                    <p className="font-body text-sm font-bold text-ink">
                      {line.name}
                    </p>
                    <p className="font-body text-xs text-ink/50">
                      {siteConfig.currency}
                      {line.price.toLocaleString()} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-cream-dim">
                    <button
                      onClick={() => decrement(line.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-chili hover:bg-chili/10"
                      aria-label={`Remove one ${line.name}`}
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-body text-xs font-bold">
                      {line.qty}
                    </span>
                    <button
                      onClick={() => increment(line.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-chili hover:bg-chili/10"
                      aria-label={`Add one more ${line.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(line.id)}
                    aria-label={`Remove ${line.name} from cart`}
                    className="text-ink/30 transition hover:text-chili"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {lines.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 border-t border-ink/10 pt-5">
              <span className="font-body text-xs font-bold uppercase tracking-wider text-ink/50">
                Delivery Details
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="rounded-xl border border-ink/10 bg-white px-4 py-2.5 font-body text-sm outline-none ring-chili/30 focus:ring-2"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                inputMode="tel"
                className="rounded-xl border border-ink/10 bg-white px-4 py-2.5 font-body text-sm outline-none ring-chili/30 focus:ring-2"
              />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
                rows={2}
                className="resize-none rounded-xl border border-ink/10 bg-white px-4 py-2.5 font-body text-sm outline-none ring-chili/30 focus:ring-2"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Order notes (optional) — e.g. less spicy, no onions"
                rows={2}
                className="resize-none rounded-xl border border-ink/10 bg-white px-4 py-2.5 font-body text-sm outline-none ring-chili/30 focus:ring-2"
              />

              <div className="flex gap-2">
                {["Cash on Delivery", "Online Transfer"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 rounded-xl px-3 py-2 font-body text-xs font-bold transition ${
                      paymentMethod === method
                        ? "bg-ink text-cream"
                        : "bg-white text-ink/60 ring-1 ring-ink/10"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {touched && !canCheckout && (
                <p className="font-body text-xs font-semibold text-chili">
                  Please fill in name, phone and address to continue.
                </p>
              )}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-ink/10 bg-white px-5 py-4">
            <div className="mb-3 flex flex-col gap-1 font-body text-sm text-ink/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {siteConfig.currency}
                  {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {deliveryFee === 0
                    ? "FREE"
                    : `${siteConfig.currency}${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between font-display text-lg text-ink">
                <span>Total</span>
                <span>
                  {siteConfig.currency}
                  {total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="krazy-bite flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-6 py-4 font-body text-sm font-extrabold uppercase tracking-wider text-cream shadow-lg shadow-leaf/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              <span aria-hidden>💬</span> Order via WhatsApp
            </button>
            <p className="mt-2 text-center font-body text-[11px] text-ink/40">
              Aap ka order WhatsApp par khul jayega — bas send karein.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
