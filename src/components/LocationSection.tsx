import { siteConfig } from "@/config/site";

export default function LocationSection() {
  return (
    <section id="location" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <div className="motion-card theme-card animate-pop-in grid grid-cols-1 gap-10 overflow-hidden rounded-2xl bg-white p-8 shadow-xl shadow-ink/8 ring-1 ring-ink/8 hover:shadow-2xl hover:shadow-ink/10 md:grid-cols-2 md:p-14">
        <div>
          <span className="font-body text-xs font-extrabold uppercase tracking-[0.2em] text-chili">
            Find Us
          </span>
          <h2 className="mt-2 font-display text-5xl leading-none tracking-wide text-ink">
            VISIT OR ORDER IN
          </h2>
          <p className="mt-4 font-body font-medium leading-7 text-ink/68">
            {siteConfig.address}
          </p>

          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-shine krazy-bite mt-6 inline-flex items-center gap-2 rounded-xl bg-chili px-6 py-3.5 font-body text-sm font-extrabold uppercase tracking-wider text-cream shadow-lg shadow-chili/25 transition hover:-translate-y-0.5 hover:bg-chili-dark active:scale-95"
          >
            <span aria-hidden>{"\u{1F4AC}"}</span> {siteConfig.phoneDisplay}
          </a>
        </div>

        <div className="theme-muted-card rounded-xl bg-cream p-5 ring-1 ring-ink/8 transition hover:-translate-y-0.5">
          <span className="font-body text-xs font-extrabold uppercase tracking-[0.2em] text-chili">
            Hours
          </span>
          <div className="mt-3 flex flex-col gap-2">
            {siteConfig.hours.map((h) => (
              <div
                key={h.day}
                className="flex justify-between gap-4 border-b border-ink/10 py-3 font-body text-sm text-ink/80 last:border-b-0"
              >
                <span className="font-extrabold">{h.day}</span>
                <span className="text-right font-semibold">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
