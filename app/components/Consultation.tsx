"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

const stats = [
  { value: 1000, suffix: "+", label: "Satisfied Customers" },
  { value: 18, suffix: "", label: "Years of Practice" },
  { value: 6, suffix: "", label: "Municipalities Served" },
];

// Counts up from 0 to `to` the first time it scrolls into view.
function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return <span ref={ref}>{n.toLocaleString()}</span>;
}

export function Consultation() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
      <div className="grid gap-8 border-y border-umber/20 py-14 md:grid-cols-3 md:py-16">
        {stats.map((s) => (
          <Reveal key={s.label}>
            <div className="text-center">
              <p className="font-display text-6xl leading-none text-ink md:text-7xl">
                <Counter to={s.value} />
                {s.suffix}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-umber/70">
                {s.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
