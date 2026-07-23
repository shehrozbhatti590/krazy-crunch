const points = [
  {
    icon: "\u{1F525}",
    title: "Double-Fried Crunch",
    text: "Every piece is fried twice in fresh oil for that signature Krazy shatter.",
  },
  {
    icon: "\u{1F336}\u{FE0F}",
    title: "3 Spice Levels",
    text: "Mild to Krazy-hot - tell us your level, we'll match it.",
  },
  {
    icon: "\u{1F6F5}",
    title: "Fast, Hot Delivery",
    text: "Sealed and rushed out so it reaches you as hot as the fryer.",
  },
  {
    icon: "\u{1F4AC}",
    title: "Order on WhatsApp",
    text: "No app, no signup. Add to cart, confirm, send - that's it.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-ink py-16 text-cream md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
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
              className="motion-card group animate-pop-in rounded-xl border border-cream/10 bg-cream/8 p-5 hover:-translate-y-1 hover:border-mustard/45 hover:bg-cream/12"
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
