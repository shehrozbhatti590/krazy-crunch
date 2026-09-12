"use client";

import { useEffect, useMemo, useState } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { supabase } from "@/lib/supabase";
import { DEFAULT_DELIVERY_FEE } from "@/config/pos-settings";
import type { OrderLineItem, OrderType, PaymentMethod } from "@/lib/pos-types";
import type { DbMenuItem } from "@/lib/menu-types";

const orderTypes: { id: OrderType; label: string; icon: string }[] = [
  { id: "takeaway", label: "Takeaway", icon: "\u{1F6CD}\uFE0F" },
  { id: "dine-in", label: "Dine-in", icon: "\u{1F37D}\uFE0F" },
  { id: "delivery", label: "Delivery", icon: "\u{1F6F5}" },
];

export default function OrderBuilder({ onOrderCreated }: { onOrderCreated: () => void }) {
  const { items: dbItems, categories, loading: menuLoading } = useMenuItems(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState<OrderLineItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_DELIVERY_FEE);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [variantPicker, setVariantPicker] = useState<DbMenuItem | null>(null);

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    if (orderType === "delivery") {
      setDeliveryFee(DEFAULT_DELIVERY_FEE);
    } else {
      setDeliveryFee(0);
    }
  }, [orderType]);

  const items = useMemo(
    () => dbItems.filter((item) => item.category === activeCategory),
    [dbItems, activeCategory]
  );

  const itemsTotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0);
  const total = itemsTotal + deliveryFee;
  const itemCount = cart.reduce((sum, line) => sum + line.qty, 0);

  function addItem(id: string, name: string, price: number) {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === id);
      if (existing) {
        return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line));
      }
      return [...prev, { id, name, price, qty: 1 }];
    });
  }

  function handleTapMenuItem(item: DbMenuItem) {
    if (item.variants && item.variants.length > 0) {
      setVariantPicker(item);
    } else {
      addItem(item.id, item.name, item.price);
    }
  }

  function pickVariant(v: { label: string; price: number }) {
    if (!variantPicker) return;
    addItem(`${variantPicker.id}::${v.label}`, `${variantPicker.name} (${v.label})`, v.price);
    setVariantPicker(null);
  }

  function addCustomItem() {
    const price = Number(customPrice);
    if (!customName.trim() || !price || price <= 0) return;
    addItem(`custom-${Date.now()}`, customName.trim(), price);
    setCustomName("");
    setCustomPrice("");
    setCustomOpen(false);
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((line) => (line.id === id ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0)
    );
  }

  function resetOrder() {
    setCart([]);
    setNotes("");
  }

  async function completeOrder() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setFeedback(null);
    setLastOrderId(null);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        items: cart,
        subtotal: total,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod,
        order_type: orderType,
        status: "completed",
        notes: notes.trim() || null,
        staff_name: staffName.trim() || null,
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (error || !data) {
      setFeedback({
        type: "error",
        text: `Could not save order: ${error?.message ?? "unknown error"}`,
      });
      return;
    }

    setFeedback({ type: "success", text: "Order saved." });
    setLastOrderId(data.id);
    resetOrder();
    onOrderCreated();
  }

  function printLastReceipt() {
    if (!lastOrderId) return;
    window.open(`/pos/receipt/${lastOrderId}`, "_blank", "width=380,height=700");
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      {/* Menu picker */}
      <div>
        <div className="flex gap-1.5 overflow-x-auto rounded-full border border-[#f5f4fb]/10 bg-[#14111a] p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide transition ${
                activeCategory === cat
                  ? "bg-mustard text-[#17110d]"
                  : "text-[#f5f4fb]/55 hover:bg-[#f5f4fb]/10 hover:text-[#f5f4fb]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {menuLoading && (
          <p className="mt-4 font-body text-sm text-[#f5f4fb]/40">Loading menu...</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const hasVariants = !!(item.variants && item.variants.length > 0);
            return (
              <button
                key={item.id}
                onClick={() => handleTapMenuItem(item)}
                className="relative flex flex-col items-start gap-1 rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-3.5 text-left transition hover:-translate-y-0.5 hover:border-mustard/50 active:scale-95"
              >
                {hasVariants && (
                  <span className="absolute right-2 top-2 rounded-full bg-mustard/15 px-2 py-0.5 font-body text-[9px] font-bold uppercase text-mustard">
                    Sizes
                  </span>
                )}
                <span className="text-2xl" aria-hidden>
                  {item.emoji}
                </span>
                <span className="mt-1 font-body text-sm font-bold leading-tight text-[#f5f4fb]">
                  {item.name}
                </span>
                <span className="font-display text-lg leading-none text-mustard">
                  {hasVariants && (
                    <span className="text-xs font-body font-semibold text-[#f5f4fb]/40">From </span>
                  )}
                  Rs.{item.price.toLocaleString()}
                </span>
              </button>
            );
          })}

          <div className="flex flex-col justify-center rounded-xl border border-dashed border-mustard/40 bg-mustard/5 p-3.5">
            {!customOpen ? (
              <button
                onClick={() => setCustomOpen(true)}
                className="flex h-full flex-col items-center justify-center gap-1.5 py-3 text-center transition hover:-translate-y-0.5 active:scale-95"
              >
                <span className="text-2xl leading-none text-mustard" aria-hidden>
                  +
                </span>
                <span className="font-body text-xs font-extrabold uppercase tracking-wide text-mustard">
                  Custom Item
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Item name"
                  className="rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-2.5 py-2 font-body text-sm text-[#f5f4fb] outline-none placeholder:text-[#f5f4fb]/30 focus:border-mustard/50"
                />
                <input
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                  inputMode="numeric"
                  placeholder="Price (Rs.)"
                  className="rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-2.5 py-2 font-body text-sm text-[#f5f4fb] outline-none placeholder:text-[#f5f4fb]/30 focus:border-mustard/50"
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setCustomOpen(false);
                      setCustomName("");
                      setCustomPrice("");
                    }}
                    className="flex-1 rounded-lg bg-[#f5f4fb]/10 py-2 font-body text-xs font-bold uppercase text-[#f5f4fb]/60 transition hover:bg-[#f5f4fb]/15"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomItem}
                    className="flex-1 rounded-lg bg-mustard py-2 font-body text-xs font-extrabold uppercase text-[#17110d] transition hover:brightness-95"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart / checkout */}
      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a] p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl tracking-wide text-[#f5f4fb]">Current Order</h2>
          {cart.length > 0 && (
            <button
              onClick={resetOrder}
              className="font-body text-[11px] font-bold uppercase tracking-wide text-[#f5f4fb]/40 hover:text-chili"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {cart.length === 0 && (
            <p className="py-6 text-center font-body text-sm text-[#f5f4fb]/40">
              Tap menu items to add them here.
            </p>
          )}
          {cart.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-[#f5f4fb]/5 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-body text-sm font-bold text-[#f5f4fb]">{line.name}</p>
                <p className="font-body text-xs text-[#f5f4fb]/45">
                  Rs.{line.price.toLocaleString()} x {line.qty}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => changeQty(line.id, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f4fb]/10 font-bold text-[#f5f4fb] hover:bg-chili"
                >
                  -
                </button>
                <span className="w-5 text-center font-body text-sm font-extrabold text-[#f5f4fb]">
                  {line.qty}
                </span>
                <button
                  onClick={() => changeQty(line.id, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f4fb]/10 font-bold text-[#f5f4fb] hover:bg-leaf"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1.5 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
            Order Type
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {orderTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setOrderType(type.id)}
                className={`flex flex-col items-center gap-1 rounded-lg py-2 font-body text-[10px] font-bold uppercase transition ${
                  orderType === type.id
                    ? "bg-mustard text-[#17110d]"
                    : "bg-[#f5f4fb]/5 text-[#f5f4fb]/55 hover:bg-[#f5f4fb]/10"
                }`}
              >
                <span aria-hidden>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {orderType === "delivery" && (
          <div>
            <p className="mb-1.5 flex items-center justify-between font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
              <span>Delivery Fee</span>
              {deliveryFee === 0 && (
                <span className="rounded-full bg-leaf/15 px-2 py-0.5 text-leaf">Free</span>
              )}
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-[#f5f4fb]/10 bg-[#0b0a0f] px-3 py-2.5">
              <span className="font-body text-sm text-[#f5f4fb]/50">Rs.</span>
              <input
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                inputMode="numeric"
                className="w-full bg-transparent font-body text-sm text-[#f5f4fb] outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
            Payment
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(["cash", "online"] as PaymentMethod[]).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`rounded-lg py-2.5 font-body text-xs font-extrabold uppercase transition ${
                  paymentMethod === method
                    ? "bg-leaf text-[#0b1a10]"
                    : "bg-[#f5f4fb]/5 text-[#f5f4fb]/55 hover:bg-[#f5f4fb]/10"
                }`}
              >
                {method === "cash" ? "\u{1F4B5} Cash" : "\u{1F4B3} Online"}
              </button>
            ))}
          </div>
        </div>

        <input
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          placeholder="Staff name (optional)"
          className="rounded-lg border border-[#f5f4fb]/10 bg-[#0b0a0f] px-3 py-2.5 font-body text-sm text-[#f5f4fb] outline-none placeholder:text-[#f5f4fb]/30 focus:border-mustard/50"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Order notes (optional)"
          rows={2}
          className="resize-none rounded-lg border border-[#f5f4fb]/10 bg-[#0b0a0f] px-3 py-2.5 font-body text-sm text-[#f5f4fb] outline-none placeholder:text-[#f5f4fb]/30 focus:border-mustard/50"
        />

        <div className="border-t border-[#f5f4fb]/10 pt-3">
          {deliveryFee > 0 && (
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-body text-xs text-[#f5f4fb]/45">Items subtotal</span>
              <span className="font-body text-xs text-[#f5f4fb]/70">
                Rs.{itemsTotal.toLocaleString()}
              </span>
            </div>
          )}
          {deliveryFee > 0 && (
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-body text-xs text-[#f5f4fb]/45">Delivery fee</span>
              <span className="font-body text-xs text-[#f5f4fb]/70">
                Rs.{deliveryFee.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-body text-xs font-bold uppercase tracking-wide text-[#f5f4fb]/50">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
            <span className="font-display text-2xl leading-none text-mustard">
              Rs.{total.toLocaleString()}
            </span>
          </div>
        </div>

        {feedback && (
          <div
            className={`flex flex-col items-center gap-2 rounded-lg p-2.5 text-center ${
              feedback.type === "success" ? "bg-leaf/10" : "bg-chili/10"
            }`}
          >
            <p
              className={`font-body text-xs font-bold ${
                feedback.type === "success" ? "text-leaf" : "text-chili"
              }`}
            >
              {feedback.text}
            </p>
            {feedback.type === "success" && lastOrderId && (
              <button
                onClick={printLastReceipt}
                className="rounded-lg bg-mustard px-4 py-2 font-body text-[11px] font-extrabold uppercase tracking-wide text-[#17110d] transition hover:brightness-95"
              >
                Print Receipt
              </button>
            )}
          </div>
        )}

        <button
          onClick={completeOrder}
          disabled={cart.length === 0 || submitting}
          className="cta-shine rounded-xl bg-mustard py-3.5 font-body text-sm font-extrabold uppercase tracking-wider text-[#17110d] transition hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Complete Order"}
        </button>
      </div>

      {variantPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl tracking-wide text-[#f5f4fb]">
                {variantPicker.name}
              </h3>
              <button
                onClick={() => setVariantPicker(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f4fb]/10 text-[#f5f4fb]/60"
              >
                &times;
              </button>
            </div>
            <p className="mt-1 font-body text-xs text-[#f5f4fb]/45">Choose a size</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {variantPicker.variants?.map((v) => (
                <button
                  key={v.label}
                  onClick={() => pickVariant(v)}
                  className="rounded-xl border border-[#f5f4fb]/10 bg-[#0b0a0f] p-3 text-left transition hover:border-mustard/50 active:scale-95"
                >
                  <p className="font-body text-xs font-bold text-[#f5f4fb]">{v.label}</p>
                  <p className="font-display text-lg leading-none text-mustard">
                    Rs.{v.price.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
