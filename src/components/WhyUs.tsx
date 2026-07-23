const points = [
  {
    icon: "🔥",
    title: "Double-Fried Crunch",
    text: "Every piece is fried twice in fresh oil for that signature Krazy shatter.",
  },
  {
    icon: "🌶️",
    title: "3 Spice Levels",
    text: "Mild to Krazy-hot — tell us your level, we'll match it.",
  },
  {
    icon: "🛵",
    title: "Fast, Hot Delivery",
    text: "Sealed and rushed out so it reaches you as hot as the fryer.",
  },
  {
    icon: "💬",
    title: "Order on WhatsApp",
    text: "No app, no signup. Add to cart, confirm, send — that's it.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-ink py-16 text-cream md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-mustard">
          Why Krazy Crunch
        </span>
        <h2 className="mt-2 max-w-lg font-display text-4xl tracking-wide md:text-5xl">
          MADE KRAZY, SERVED FAST.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <div key={p.title}>
              <span className="text-3xl" aria-hidden>
                {p.icon}
              </span>
              <h3 className="mt-3 font-display text-xl tracking-wide">
                {p.title}
              </h3>
              <p className="mt-1 font-body text-sm text-cream/60">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
