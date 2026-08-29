"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Project } from "../lib/portfolio";
import { LoadingCurtain } from "./LoadingCurtain";

const DURATION = 5500;

declare global {
  interface Window {
    __heroLoaded?: boolean;
  }
}

// Marks the curtain as already shown, so LoadingCurtain skips it on any
// later mount within this session (client-side nav back to "/").
function signalHeroLoaded() {
  window.__heroLoaded = true;
}

export function Hero({ slides }: { slides: Project[] }) {
  const [i, setI] = useState(0);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), DURATION);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    // ponytail: next/image can drop onLoad if decode() resolves after unmount,
    // and a failed image never fires either handler — same guard as Nav's.
    const t = setTimeout(() => setImageReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const active = slides[i];

  return (
    <section id="top" className="bg-cream px-3 pb-3 pt-(--nav-h) md:px-4">
      {/* The hero itself is a full-bleed photo carousel with no room for a
          literal headline — this is the page's real h1 for crawlers/screen
          readers, visually hidden rather than skipped. */}
      <h1 className="sr-only">
        SHAFE Design Studio — Interior Design, Architecture &amp; Permit
        Drawings in Oakville, Ontario
      </h1>
      <LoadingCurtain ready={imageReady} onOpened={signalHeroLoaded} />
      <div
        data-nav-dark
        className="hero-open relative h-[calc(100vh-84px)] min-h-[560px] overflow-hidden rounded-3xl bg-espresso md:rounded-4xl"
      >
        {/* Crossfading carousel */}
        <AnimatePresence>
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: DURATION / 1000 + 1.3, ease: "easeOut" }}
            >
              <Image
                src={active.cover}
                alt={active.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ filter: "sepia(0.28) saturate(1.05) brightness(0.92)" }}
                onLoad={i === 0 ? () => setImageReady(true) : undefined}
                onError={i === 0 ? () => setImageReady(true) : undefined}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-transparent" />

        {/* Caption card */}
        <div className="absolute bottom-5 left-5 right-5 flex justify-start md:bottom-8 md:left-8 md:right-auto">
          <motion.div
            layout
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-2xl border border-cream/10 bg-ink/55 px-6 pb-6 pt-4 backdrop-blur-md md:max-w-lg"
          >
            <span className="mb-4 block h-px w-10 bg-cream/50" />
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-end justify-between gap-4"
              >
                <div>
                  <h2 className="text-xl leading-tight text-cream md:text-2xl">
                    {active.name}
                  </h2>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.25em] text-sand">
                    {active.meta}
                  </p>
                </div>
                <Link
                  href={`/projects/${active.slug}`}
                  className="shrink-0 text-xs uppercase tracking-[0.25em] text-cream transition-colors hover:text-terracotta"
                >
                  View
                </Link>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 right-6 hidden items-center gap-2 md:flex">
          {slides.map((s, idx) => (
            <button
              key={s.slug}
              onClick={() => setI(idx)}
              aria-label={`Show ${s.title}`}
              className="h-1 rounded-full bg-cream/40 transition-all duration-500"
              style={{ width: idx === i ? 28 : 12, opacity: idx === i ? 1 : 0.5 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
