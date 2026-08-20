"use client";

import { useEffect, useRef, useState } from "react";

const presets = [
  { id: "yellow", label: "Yellow", swatch: "#eab308" },
  { id: "red", label: "Red", swatch: "#dc2626" },
  { id: "indigo", label: "Indigo", swatch: "#6172f3" },
  { id: "green", label: "Green", swatch: "#16a34a" },
  { id: "orange", label: "Orange", swatch: "#f97316" },
] as const;

type PresetId = (typeof presets)[number]["id"];

export default function ColorPresetSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<PresetId>("yellow");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.colorPreset as PresetId | undefined;
    if (current) setActive(current);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectPreset(id: PresetId) {
    setActive(id);
    document.documentElement.dataset.colorPreset = id;
    window.localStorage.setItem("krazy-crunch-color-preset", id);
    setOpen(false);
  }

  const activeSwatch = presets.find((p) => p.id === active)?.swatch ?? "#6172f3";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose accent color"
        aria-expanded={open}
        className="flex h-12 items-center gap-2 rounded-full border border-cream/15 bg-cream/8 px-3 text-cream shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-mustard/50 hover:bg-cream/12 active:scale-95"
      >
        <span
          className="h-5 w-5 rounded-full border border-white/30 shadow-inner"
          style={{ backgroundColor: activeSwatch }}
          aria-hidden
        />
        <span className="hidden font-body text-xs font-extrabold uppercase tracking-[0.12em] sm:inline">
          Theme
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 flex gap-2 rounded-2xl border border-cream/10 bg-ink/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset.id)}
              aria-label={`${preset.label} theme`}
              title={preset.label}
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition hover:scale-110 active:scale-95 ${
                active === preset.id ? "border-cream" : "border-transparent"
              }`}
            >
              <span
                className="h-8 w-8 rounded-full shadow-md"
                style={{ backgroundColor: preset.swatch }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}