"use client";

import { useState } from "react";
import type { DbMenuItem, MenuAccent, MenuItemInput, MenuVariant } from "@/lib/menu-types";

const accents: MenuAccent[] = ["chili", "mustard", "leaf"];

const DEFAULT_SIZE_LABELS = [
  'Small (7")',
  'Medium (11")',
  'Large (13")',
  'XLarge (16")',
];

export default function MenuItemForm({
  item,
  categories,
  onSave,
  onClose,
}: {
  item: DbMenuItem | null;
  categories: string[];
  onSave: (input: MenuItemInput) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [category, setCategory] = useState(item?.category ?? categories[0] ?? "");
  const [emoji, setEmoji] = useState(item?.emoji ?? "\u{1F37D}\uFE0F");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [accent, setAccent] = useState<MenuAccent>(item?.accent ?? "mustard");
  const [badge, setBadge] = useState(item?.badge ?? "");
  const [spiceLevel, setSpiceLevel] = useState(item?.spice_level ?? 0);
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [hasSizes, setHasSizes] = useState(!!(item?.variants && item.variants.length > 0));
  const [variants, setVariants] = useState<MenuVariant[]>(
    item?.variants && item.variants.length > 0
      ? item.variants
      : DEFAULT_SIZE_LABELS.map((label) => ({ label, price: 0 }))
  );

  function updateVariant(index: number, field: "label" | "price", value: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? { ...v, [field]: field === "price" ? Number(value.replace(/[^0-9]/g, "")) || 0 : value }
          : v
      )
    );
  }

  function addVariantRow() {
    setVariants((prev) => [...prev, { label: "", price: 0 }]);
  }

  function removeVariantRow(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !category.trim()) {
      setError("Name and category are required.");
      return;
    }
    if (!imageUrl.trim()) {
      setError("A background image URL is required.");
      return;
    }
    try {
      new URL(imageUrl.trim());
    } catch {
      setError("Image URL doesn't look valid - it should start with https://");
      return;
    }

    let finalPrice: number;
    let finalVariants: MenuVariant[] | null;

    if (hasSizes) {
      const cleanVariants = variants
        .map((v) => ({ label: v.label.trim(), price: Number(v.price) }))
        .filter((v) => v.label && v.price > 0);
      if (cleanVariants.length < 2) {
        setError("Add at least 2 sizes with a name and a valid price.");
        return;
      }
      finalVariants = cleanVariants;
      finalPrice = Math.min(...cleanVariants.map((v) => v.price));
    } else {
      const priceNum = Number(price);
      if (!priceNum || priceNum <= 0) {
        setError("A valid price is required.");
        return;
      }
      finalVariants = null;
      finalPrice = priceNum;
    }

    setError("");
    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim(),
      price: finalPrice,
      category: category.trim(),
      emoji: emoji.trim() || "\u{1F37D}\uFE0F",
      image_url: imageUrl.trim(),
      accent,
      badge: badge.trim() || null,
      spice_level: spiceLevel,
      is_active: isActive,
      sort_order: item?.sort_order ?? 999,
      variants: finalVariants,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide text-[#f5f4fb]">
            {item ? "Edit Item" : "Add New Item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f4fb]/10 text-[#f5f4fb]/60 hover:bg-[#f5f4fb]/20"
          >
            &times;
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3.5">
          <div>
            <label className="mb-1 block font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Tikka Pizza"
              className="w-full rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-3 py-2.5 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
            />
          </div>

          <div>
            <label className="mb-1 block font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short description shown on the menu card"
              className="w-full resize-none rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-3 py-2.5 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
              Background Image URL
              <span className="text-chili">*</span>
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              required
              className="w-full rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-3 py-2.5 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
            />
            {imageUrl.trim() && (
              <div
                className="mt-2 h-24 w-full rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl.trim()})` }}
              />
            )}
          </div>

          <label className="flex items-center gap-2.5 rounded-lg border border-mustard/30 bg-mustard/10 px-3 py-2.5">
            <input
              type="checkbox"
              checked={hasSizes}
              onChange={(e) => setHasSizes(e.target.checked)}
              className="h-4 w-4 accent-mustard"
            />
            <span className="font-body text-sm font-bold text-[#f5f4fb]">
              This item has multiple sizes (e.g. pizza)
            </span>
          </label>

          {hasSizes ? (
            <div className="flex flex-col gap-2 rounded-lg border border-[#f5f4fb]/10 bg-[#0b0a0f] p-3">
              <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
                Sizes &amp; Prices
              </p>
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={v.label}
                    onChange={(e) => updateVariant(i, "label", e.target.value)}
                    placeholder="Size name"
                    className="flex-1 rounded-lg border border-[#f5f4fb]/15 bg-[#14111a] px-3 py-2 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
                  />
                  <input
                    value={v.price || ""}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    inputMode="numeric"
                    placeholder="Price"
                    className="w-24 rounded-lg border border-[#f5f4fb]/15 bg-[#14111a] px-3 py-2 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariantRow(i)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chili/10 text-chili transition hover:bg-chili/20"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariantRow}
                className="mt-1 rounded-lg border border-dashed border-[#f5f4fb]/20 py-2 font-body text-xs font-bold uppercase text-[#f5f4fb]/50 transition hover:border-mustard/40 hover:text-mustard"
              >
                + Add another size
              </button>
            </div>
          ) : (
            <div>
              <label className="mb-1 block font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
                Price (Rs.)
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="550"
                className="w-full rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-3 py-2.5 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
              Category
            </label>
            <input
              list="category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Pizza"
              className="w-full rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-3 py-2.5 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
            />
            <datalist id="category-options">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
                Emoji
              </label>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-3 py-2.5 text-center text-lg text-[#f5f4fb] outline-none focus:border-mustard/50"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
                Badge (optional)
              </label>
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Bestseller, New..."
                className="w-full rounded-lg border border-[#f5f4fb]/15 bg-[#0b0a0f] px-3 py-2.5 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
              Card Color Accent
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {accents.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAccent(a)}
                  className={`rounded-lg py-2 font-body text-xs font-extrabold uppercase transition ${
                    accent === a
                      ? a === "chili"
                        ? "bg-chili text-white"
                        : a === "mustard"
                          ? "bg-mustard text-[#17110d]"
                          : "bg-leaf text-white"
                      : "bg-[#f5f4fb]/5 text-[#f5f4fb]/50 hover:bg-[#f5f4fb]/10"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
              Spice Level
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpiceLevel(level)}
                  className={`rounded-lg py-2 font-body text-xs font-extrabold transition ${
                    spiceLevel === level
                      ? "bg-chili text-white"
                      : "bg-[#f5f4fb]/5 text-[#f5f4fb]/50 hover:bg-[#f5f4fb]/10"
                  }`}
                >
                  {level === 0 ? "None" : "\u{1F336}\uFE0F".repeat(level)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 rounded-lg border border-[#f5f4fb]/10 bg-[#f5f4fb]/5 px-3 py-2.5">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-mustard"
            />
            <span className="font-body text-sm font-bold text-[#f5f4fb]/80">
              Visible on site &amp; POS
            </span>
          </label>

          {error && <p className="font-body text-xs font-bold text-chili">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 rounded-xl bg-mustard py-3 font-body text-sm font-extrabold uppercase tracking-wider text-[#17110d] transition hover:brightness-95 active:scale-95 disabled:opacity-60"
          >
            {saving ? "Saving..." : item ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
