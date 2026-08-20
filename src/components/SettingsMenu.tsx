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
type Theme = "light" | "dark";

function SettingsContent() {
  const [preset, setPreset] = useState<PresetId>("yellow");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const currentPreset = document.documentElement.dataset.colorPreset as PresetId | undefined;
    if (currentPreset) setPreset(currentPreset);
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  function selectPreset(id: PresetId) {
    setPreset(id);
    document.documentElement.dataset.colorPreset = id;
    window.localStorage.setItem("krazy-crunch-color-preset", id);
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("krazy-crunch-theme", next);
  }

  return (
    <div className="w-full">
      <div>
        <p className="font-body text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f5f4fb]/45">
          Accent Color
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPreset(p.id)}
              aria-label={`${p.label} theme`}
              title={p.label}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition hover:scale-110 active:scale-95 ${
                preset === p.id ? "border-[#f5f4fb]" : "border-transparent"
              }`}
            >
              <span
                className="h-6 w-6 rounded-full shadow-md"
                style={{ backgroundColor: p.swatch }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-[#f5f4fb]/10 pt-4">
        <p className="font-body text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f5f4fb]/45">
          Appearance
        </p>
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="mt-2 flex h-11 items-center gap-1 rounded-full border border-[#f5f4fb]/15 bg-[#f5f4fb]/8 p-1 text-[#f5f4fb] shadow-md shadow-black/10 transition hover:border-mustard/50 active:scale-95"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
              theme === "light"
                ? "bg-mustard text-[#17110d] shadow-md shadow-mustard/25"
                : "text-[#f5f4fb]/55"
            }`}
            aria-hidden
          >
            {"\u2600"}
          </span>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
              theme === "dark"
                ? "bg-mustard text-[#17110d] shadow-md shadow-mustard/25"
                : "text-[#f5f4fb]/55"
            }`}
            aria-hidden
          >
            {"\u263E"}
          </span>
        </button>
      </div>
    </div>
  );
}

/** Used inside the mobile hamburger panel - always expanded, no nested popup. */
export function SettingsInline() {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-[#f5f4fb]/10 bg-[#f5f4fb]/5 p-4">
      <SettingsContent />
    </div>
  );
}

/** Used in the desktop header row - gear icon that opens a dropdown. */
export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open settings"
        aria-expanded={open}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition hover:-translate-y-0.5 active:scale-95 ${
          open
            ? "border-mustard bg-mustard text-[#17110d]"
            : "border-[#f5f4fb]/15 bg-[#f5f4fb]/8 text-[#f5f4fb] hover:border-mustard/50 hover:bg-[#f5f4fb]/12"
        }`}
      >
        <span aria-hidden className="text-lg">
          {"\u2699\uFE0F"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#f5f4fb]/10 bg-[#0b0a0f] p-4 shadow-2xl shadow-black/40">
          <SettingsContent />
        </div>
      )}
    </div>
  );
}
