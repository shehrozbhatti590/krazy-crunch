import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <span className="font-display text-xl tracking-wide text-cream">
          KRAZY<span className="text-mustard">CRUNCH</span>
        </span>

        <div className="flex gap-6 font-body text-sm">
          <a href="#menu" className="hover:text-mustard">Menu</a>
          <a href="#why-us" className="hover:text-mustard">Why Us</a>
          <a href="#location" className="hover:text-mustard">Location</a>
          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-mustard"
          >
            Instagram
          </a>
        </div>

        <p className="font-body text-xs">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
