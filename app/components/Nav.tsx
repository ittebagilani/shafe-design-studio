"use client";

import Image from "next/image";
import Link from "next/link";
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

  const [dark, setDark] = useState(false);

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

  // No entrance animation: the loading curtain (z-100, above this) already
  // covers the whole page while it's up, so the nav — blur included — is
  // fully settled underneath it and just appears, already resolved, the
  // instant the curtain opens, instead of visibly popping in afterward.
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
      {/* Progressive blur: fades the blur out at the bottom so there's no hard edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[180%] backdrop-blur-md [-webkit-mask-image:linear-gradient(to_bottom,black_35%,transparent)] [mask-image:linear-gradient(to_bottom,black_35%,transparent)]"
      />
      <nav className="relative flex items-center justify-between px-5 py-3 md:px-8">
        <Link
          href={resolve("/")}
          aria-label="SHAFE Design Studio, home"
          className="flex items-center"
        >
          <Image
            src="/images/logo/shafe-logo.png"
            alt="SHAFE Design Studio"
            width={4000}
            height={974}
            priority
            className={`h-9 w-auto transition-[filter] duration-500 md:h-10 ${
              dark ? "brightness-0 invert" : ""
            }`}
          />
        </Link>

        <div className="flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.label}
              href={resolve(l.href)}
              className={`${pill} hidden sm:flex`}
            >
              {l.label}
              {l.plus && <span className="text-sm leading-none">+</span>}
            </Link>
          ))}

          <Link
            href={resolve("/book")}
            className="flex items-center gap-1.5 rounded-lg bg-terracotta px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream backdrop-blur-md transition-colors duration-500 hover:bg-clay"
          >
            Book Now
          </Link>
        </div>
      </nav>
    </header>
  );
}
