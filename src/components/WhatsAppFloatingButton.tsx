"use client";

import { siteConfig } from "@/config/site";

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
        "Hi Krazy Crunch! I'd like to place an order."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="animate-gentle-bounce fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-xl bg-leaf text-2xl text-cream shadow-xl shadow-leaf/40 transition hover:brightness-110 active:scale-95 md:bottom-8 md:right-8"
    >
      <span aria-hidden>{"\u{1F4AC}"}</span>
    </a>
  );
}
