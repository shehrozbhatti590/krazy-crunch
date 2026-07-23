export default function SpiceLevel({ level }: { level: 0 | 1 | 2 | 3 }) {
  if (level === 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5" title={`Spice level ${level}/3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`text-xs ${i < level ? "opacity-100" : "opacity-20"}`}
        >
          {"\u{1F336}\u{FE0F}"}
        </span>
      ))}
    </span>
  );
}
