import type { Metadata } from "next";
import "@fontsource/anton/400.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";
import "@fontsource/work-sans/800.css";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} - Fried Chicken, Burgers & Krazy Deals`,
  description:
    "Order Krazy Crunch fried chicken, zinger burgers, wraps and deals online - straight to WhatsApp, no app needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-cream text-ink antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const saved = localStorage.getItem("krazy-crunch-theme");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  document.documentElement.dataset.theme = saved || (prefersDark ? "dark" : "light");
                } catch {
                  document.documentElement.dataset.theme = "light";
                }
                try {
                  const savedPreset = localStorage.getItem("krazy-crunch-color-preset");
                  document.documentElement.dataset.colorPreset = savedPreset || "indigo";
                } catch {
                  document.documentElement.dataset.colorPreset = "indigo";
                }
              })();
            `,
          }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}