import Image from "next/image";
import Link from "next/link";

export function Footer({ showMap = false }: { showMap?: boolean }) {
  return (
    <footer className={`flex flex-col bg-espresso text-cream/70 ${showMap ? "min-h-[92vh]" : ""}`}>
      {/* ponytail: keyless classic Maps embed — no API key needed. Fixed height
          (not flex-1) so it can't balloon to fill the footer on short pages. */}
      {showMap && (
        <div className="relative h-[420px] border-b border-cream/10">
          <iframe
            title="SHAFE Design Studio location"
            src="https://www.google.com/maps?q=126+Burnhamthorpe+Road+East,+Oakville,+ON+L6H+0X9,+Canada&z=13&output=embed"
            loading="lazy"
            className="absolute inset-0 h-full w-full filter-[sepia(0.2)_saturate(0.9)_brightness(0.95)]"
            style={{ border: 0 }}
          />
        </div>
      )}
      <div className="mx-auto w-full max-w-[1600px] px-6 py-14 md:px-10 md:py-16">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo/shafe-logo-transparent.png"
            alt="SHAFE Design Studio"
            width={640}
            height={308}
            className="h-32 w-auto brightness-0 invert md:h-44"
          />

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-2">
            {/* <div className="flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-sand">Studio</span>
              <Link href="/projects" className="hover:text-cream">Projects</Link>
              <Link href="/blog" className="hover:text-cream">Blog</Link>
              <Link href="/office" className="hover:text-cream">Office</Link>
            </div> */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-sand">Contact</span>
              <a href="mailto:info@shafeinc.com" className="hover:text-cream">
                info@shafeinc.com
              </a>
            </div>
            <div className="flex flex-col items-center gap-3">
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
        <div className="mt-10 flex flex-col items-center gap-4 text-center text-xs uppercase tracking-[0.15em] text-cream/50">
          <span>© {new Date().getFullYear()} SHAFE Design Studio</span>
        </div>
      </div>
    </footer>
  );
}
