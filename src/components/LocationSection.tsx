import { siteConfig } from "@/config/site";

export default function LocationSection() {
  return (
    <section id="location" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <div className="grid grid-cols-1 gap-10 rounded-3xl bg-mustard/15 p-8 md:grid-cols-2 md:p-14 ring-1 ring-mustard/30">
        <div>
          <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-chili">
            Find Us
          </span>
          <h2 className="mt-2 font-display text-4xl tracking-wide text-ink">
            VISIT OR ORDER IN
          </h2>
          <p className="mt-4 font-body text-ink/70">{siteConfig.address}</p>

          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="krazy-bite mt-6 inline-flex items-center gap-2 rounded-2xl bg-chili px-6 py-3.5 font-body text-sm font-extrabold uppercase tracking-wider text-cream transition hover:bg-chili-dark active:scale-95"
          >
            <span aria-hidden>💬</span> {siteConfig.phoneDisplay}
          </a>
        </div>

        <div>
          <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-chili">
            Hours
          </span>
          <div className="mt-3 flex flex-col gap-2">
            {siteConfig.hours.map((h) => (
              <div
                key={h.day}
                className="flex justify-between border-b border-ink/10 py-2 font-body text-sm text-ink/80"
              >
                <span className="font-semibold">{h.day}</span>
                <span>{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
