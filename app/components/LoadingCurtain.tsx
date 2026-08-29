"use client";

import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const FADE_S = 0.8; // logo/bar fade-in
const BAR_S = 1.4; // progress bar fill
const PANEL_S = 1.6; // curtain slide duration

// Only plays on the first mount of a session — window.__heroLoaded (set by
// Hero once this finishes) makes every later visit to "/" skip straight past it.
export function LoadingCurtain({
  ready,
  onOpened,
}: {
  ready: boolean;
  onOpened: () => void;
}) {
  const [skip] = useState(
    () => typeof window !== "undefined" && window.__heroLoaded === true,
  );
  const [barStarted, setBarStarted] = useState(false);
  const [barDone, setBarDone] = useState(false);
  const [gone, setGone] = useState(false);

  const open = !skip && ready && barDone;
  const active = !skip && !gone;
  const lenis = useLenis();

  useEffect(() => {
    if (skip) return;
    const t = setTimeout(() => setBarStarted(true), FADE_S * 1000);
    return () => clearTimeout(t);
  }, [skip]);

  // The page uses Lenis for smooth scroll, which drives its own transform
  // loop and hijacks wheel/touch input directly — body { overflow: hidden }
  // alone doesn't stop it, so it has to be told to stop too.
  useEffect(() => {
    if (!active || !lenis) return;
    document.body.style.overflow = "hidden";
    lenis.stop();
    return () => {
      document.body.style.overflow = "";
      lenis.start();
    };
  }, [active, lenis]);

  if (skip || gone) return null;

  return (
    // Plain div, not motion — these two panels must be fully opaque from the
    // very first paint (no fade of their own) or the hero shows through
    // underneath while they're still transitioning in.
    <div className="fixed inset-0 z-100 flex" aria-hidden>
      <motion.div
        className="h-full w-1/2 bg-cream"
        animate={{ x: open ? "-100%" : "0%" }}
        transition={{ duration: PANEL_S, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          if (!open) return;
          setGone(true);
          onOpened();
        }}
      />
      <motion.div
        className="h-full w-1/2 bg-cream"
        animate={{ x: open ? "100%" : "0%" }}
        transition={{ duration: PANEL_S, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: open ? 0.3 : FADE_S }}
      >
        <Image
          src="/images/logo/shafe-logo-transparent.png"
          alt="SHAFE Design Studio"
          width={960}
          height={463}
          priority
          className="w-[clamp(220px,32vw,480px)]"
        />
        <div className="h-[2px] w-40 bg-ink/15">
          <motion.div
            className="h-full bg-ink"
            initial={{ width: "0%" }}
            animate={barStarted ? { width: "100%" } : undefined}
            transition={{ duration: BAR_S, ease: "easeInOut" }}
            onAnimationComplete={() => setBarDone(true)}
          />
        </div>
      </motion.div>
    </div>
  );
}
