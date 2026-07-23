import { siteConfig } from "@/config/site";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-cream">
      <div
        aria-hidden
        className="animate-sizzle-drift pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #ffc400 10%, transparent 10%, transparent 50%, #ffc400 50%, #ffc400 60%, transparent 60%, transparent 100%)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="animate-sauce-slide pointer-events-none absolute -right-20 top-20 h-36 w-80 rotate-[-12deg] bg-chili/85 shadow-2xl shadow-black/20 md:h-48 md:w-[34rem]"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-20">
        <span className="animate-pop-in mb-5 inline-flex items-center gap-2 rounded-full border border-mustard/50 bg-mustard px-4 py-1.5 font-body text-xs font-extrabold uppercase tracking-[0.18em] text-ink shadow-lg shadow-mustard/20">
          <span aria-hidden>{"\u{1F525}"}</span> Fresh oil daily - {siteConfig.city}
        </span>

        <h1 className="animate-pop-in stagger-1 max-w-5xl font-display text-[16vw] leading-[0.82] tracking-wide text-cream sm:text-7xl md:text-8xl lg:text-[7.8rem]">
          CRUNCH SO
          <br />
          LOUD, THE{" "}
          <span className="text-mustard drop-shadow-[5px_5px_0_#ff2d16]">
            NEIGHBOURS
          </span>
          <br />
          WILL ASK.
        </h1>

        <p className="animate-pop-in stagger-2 mt-6 max-w-xl font-body text-base font-medium leading-7 text-cream/76 md:text-lg">
          {siteConfig.tagline} Double-fried chicken, loaded burgers and
          krazy-hot deals - ordered in two taps, confirmed on WhatsApp,
          delivered hot.
        </p>

        <div className="animate-pop-in stagger-3 mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#menu"
            className="cta-shine krazy-bite rounded-xl bg-chili px-7 py-4 font-body text-sm font-extrabold uppercase tracking-wider text-cream shadow-xl shadow-chili/35 transition hover:-translate-y-0.5 hover:bg-chili-dark active:scale-95"
          >
            View Full Menu
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
              "Hi Krazy Crunch! I'd like to place an order."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-shine flex items-center gap-2 rounded-xl border border-cream/25 bg-cream/8 px-7 py-4 font-body text-sm font-extrabold uppercase tracking-wider text-cream transition hover:-translate-y-0.5 hover:border-mustard hover:bg-mustard hover:text-ink"
          >
            <span aria-hidden>{"\u{1F4AC}"}</span> Order on WhatsApp
          </a>
        </div>

        <div className="animate-pop-in stagger-4 mt-14 grid w-full max-w-2xl grid-cols-3 gap-3">
          {[
            ["15 min", "average fire time"],
            ["3 levels", "of Krazy spice"],
            ["4.8*", "customer rating"],
          ].map(([stat, label], i) => (
            <div
              key={label}
              className="motion-card rounded-xl border border-cream/10 bg-cream/8 p-3 backdrop-blur hover:-translate-y-1 hover:border-mustard/40"
              style={{ animationDelay: `${0.32 + i * 0.08}s` }}
            >
              <p className="font-display text-2xl leading-none text-mustard md:text-3xl">
                {stat}
              </p>
              <p className="mt-1 font-body text-[10px] font-bold uppercase tracking-wider text-cream/60 md:text-xs">
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
