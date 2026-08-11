"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { label: "Projects", href: "/projects", plus: false },
  { label: "Blog", href: "/blog", plus: false },
  { label: "Office", href: "/office", plus: true },
];

const pill =
  "flex items-center gap-1.5 font-semibold rounded-lg  bg-cream/60 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-ink backdrop-blur-md transition-colors duration-500 hover:bg-cream/75";

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Off the homepage there's no hero, and bare hash links have no target — send
  // them back to the homepage section instead.
  const resolve = (h: string) => (h.startsWith("#") && !isHome ? `/${h}` : h);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!isHome) return setHeroLoaded(true);
    if (window.__heroLoaded) return setHeroLoaded(true);
    const onLoaded = () => setHeroLoaded(true);
    window.addEventListener("hero-loaded", onLoaded);
    return () => window.removeEventListener("hero-loaded", onLoaded);
  }, [isHome]);

  // Flip to light text whenever a [data-nav-dark] region sits behind the navbar.
  useEffect(() => {
    const probeY = 32; // ~vertical center of the navbar
    let raf = 0;
    const check = () => {
      raf = 0;
      const over = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-dark]"),
      ).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probeY && r.bottom >= probeY;
      });
      setDark(over);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={heroLoaded ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 bg-transparent"
    >
      {/* Progressive blur: fades the blur out at the bottom so there's no hard edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[180%] backdrop-blur-md [-webkit-mask-image:linear-gradient(to_bottom,black_35%,transparent)] [mask-image:linear-gradient(to_bottom,black_35%,transparent)]"
      />
      <nav className="relative flex items-center justify-between px-5 py-3 md:px-8">
        <a
          href={resolve("#top")}
          className={`mt-1 font-wordmark text-3xl font-bold leading-none tracking-tight transition-colors duration-500 ${
            dark ? "text-cream" : "text-ink"
          }`}
        >
          SHAFE
        </a>

        <div className="flex items-center gap-2">
          {links.map((l) => (
            <a key={l.label} href={resolve(l.href)} className={`${pill} hidden sm:flex`}>
              {l.label}
              {l.plus && <span className="text-sm leading-none">+</span>}
            </a>
          ))}

          <a href={resolve("#projects")} aria-label="Search" className={pill}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" strokeLinecap="round" />
            </svg>
          </a>
          <a href={resolve("#contact")} aria-label="Call" className={pill}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5a2 2 0 0 1 2-2Z"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href={resolve("/book")}
            className="flex items-center gap-1.5 rounded-lg bg-terracotta px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream backdrop-blur-md transition-colors duration-500 hover:bg-clay"
          >
            Book Now
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
