import { siteConfig } from "@/config/site";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-cream">
      {/* ambient chili-flake texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #f4b41a 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-20">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-mustard/40 bg-mustard/10 px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.2em] text-mustard">
          🔥 Fresh oil daily · {siteConfig.city}
        </span>

        <h1 className="font-display text-[15vw] leading-[0.85] tracking-tight text-cream sm:text-7xl md:text-8xl lg:text-[7.5rem]">
          CRUNCH SO
          <br />
          LOUD, THE{" "}
          <span className="text-chili">NEIGHBOURS</span>
          <br />
          WILL ASK.
        </h1>

        <p className="mt-6 max-w-xl font-body text-base text-cream/70 md:text-lg">
          {siteConfig.tagline} Double-fried chicken, loaded burgers and
          krazy-hot deals — ordered in two taps, confirmed on WhatsApp,
          delivered hot.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#menu"
            className="krazy-bite rounded-2xl bg-chili px-7 py-4 font-body text-sm font-extrabold uppercase tracking-wider text-cream shadow-lg shadow-chili/30 transition hover:bg-chili-dark active:scale-95"
          >
            View Full Menu
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
              "Hi Krazy Crunch! I'd like to place an order."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-2xl border border-cream/25 px-7 py-4 font-body text-sm font-extrabold uppercase tracking-wider text-cream transition hover:border-mustard hover:text-mustard"
          >
            <span aria-hidden>💬</span> Order on WhatsApp
          </a>
        </div>

        <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4">
          {[
            ["15 min", "average fire time"],
            ["3 levels", "of Krazy spice"],
            ["4.8★", "customer rating"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-display text-3xl text-mustard">{stat}</p>
              <p className="font-body text-xs uppercase tracking-wider text-cream/60">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="jagged-edge h-6 w-full bg-cream md:h-8" />
    </section>
  );
}
