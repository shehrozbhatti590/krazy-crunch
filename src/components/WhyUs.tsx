const points = [
  {
    icon: "\u{1F525}",
    title: "Double-Fried Crunch",
    text: "Every piece is fried twice in fresh oil for that signature Krazy shatter.",
  },
  {
    icon: "\u{1F336}\u{FE0F}",
    title: "3 Spice Levels",
    text: "Mild to Krazy-hot - tell us your level, we will match it.",
  },
  {
    icon: "\u{1F6F5}",
    title: "Free Delivery",
    text: "No delivery fee, no minimum order - sealed hot and rushed to your door.",
  },
  {
    icon: "\u{1F4AC}",
    title: "Order on WhatsApp",
    text: "No app, no signup. Add to cart, confirm, send - that is it.",
  },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="theme-dark-section relative overflow-hidden bg-ink py-16 text-cream md:py-24"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=900&q=45)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--color-mustard) 26%, transparent), transparent 45%), radial-gradient(circle at 88% 85%, color-mix(in srgb, var(--color-chili) 24%, transparent), transparent 50%), linear-gradient(180deg, rgba(15,10,7,0.55) 0%, rgba(15,10,7,0.82) 55%, rgba(15,10,7,0.95) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <span className="font-body text-xs font-extrabold uppercase tracking-[0.2em] text-mustard">
          Why Krazy Crunch
        </span>
        <h2 className="animate-pop-in mt-2 max-w-lg font-display text-5xl leading-none tracking-wide md:text-6xl">
          MADE KRAZY, SERVED FAST.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <div
              key={p.title}
              className="motion-card theme-card group animate-pop-in rounded-xl border border-cream/10 bg-cream/8 p-5 backdrop-blur hover:-translate-y-1 hover:border-mustard/45 hover:bg-cream/12"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="inline-block text-3xl transition duration-300 group-hover:scale-110" aria-hidden>
                {p.icon}
              </span>
              <h3 className="mt-4 font-display text-2xl leading-none tracking-wide text-mustard">
                {p.title}
              </h3>
              <p className="mt-3 font-body text-sm leading-6 text-cream/62">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}