import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="theme-dark-section border-t border-cream/10 bg-ink text-cream/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <span className="font-display text-2xl leading-none tracking-wide text-cream">
          KRAZY<span className="text-mustard">CRUNCH</span>
        </span>

        <div className="flex flex-wrap gap-5 font-body text-sm font-bold">
          <a href="#menu" className="transition hover:text-mustard">Menu</a>
          <a href="#why-us" className="transition hover:text-mustard">Why Us</a>
          <a href="#location" className="transition hover:text-mustard">Location</a>
          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-mustard"
          >
            Instagram
          </a>
        </div>

        <p className="font-body text-xs">
          (c) {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
