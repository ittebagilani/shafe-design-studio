import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex min-h-[92vh] flex-col bg-espresso text-cream/70">
      {/* ponytail: keyless classic Maps embed — no API key needed */}
      <div className="relative min-h-85 flex-1 border-b border-cream/10">
        <iframe
          title="SHAFE Design Studio location"
          src="https://www.google.com/maps?q=126+Burnhamthorpe+Road+East,+Oakville,+ON+L6H+0X9,+Canada&z=13&output=embed"
          loading="lazy"
          className="absolute inset-0 h-full w-full filter-[sepia(0.2)_saturate(0.9)_brightness(0.95)]"
          style={{ border: 0 }}
        />
      </div>
      <div className="mx-auto w-full max-w-[1600px] px-6 py-14 md:px-10 md:py-16">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="text-3xl text-cream">SHAFE Design Studio</p>
            <p className="mt-3 max-w-xs text-sm">
              Interior design, architecture, and permit drawings across the region.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-sand">Studio</span>
              <Link href="/projects" className="hover:text-cream">Projects</Link>
              <Link href="/blog" className="hover:text-cream">Blog</Link>
              <Link href="/office" className="hover:text-cream">Office</Link>
              <Link href="/#services" className="hover:text-cream">Services</Link>
              <Link href="/#studio" className="hover:text-cream">About</Link>
            </div>
          <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-sand">Contact</span>
              <a href="mailto:info@shafeinc.com" className="hover:text-cream">
                info@shafeinc.com
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-sand">Social</span>
              <a
                href="https://www.instagram.com/shafe.inc/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cream"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 text-xs uppercase tracking-[0.15em] text-cream/50 sm:flex-row">
          <span>© {new Date().getFullYear()} SHAFE Design Studio</span>
        </div>
      </div>
    </footer>
  );
}
