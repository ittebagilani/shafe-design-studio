"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

// TODO: replace this template copy with the real studio story.
const paragraphs = [
  "Our studio is a quiet workshop for the built environment — a place where drawings, models, and material samples share the same long table. Every project begins here, in conversation, long before the first line is drawn.",
  "We designed the space the way we design for our clients: with daylight, natural materials, and room to think. Warm timber, soft clay tones, and open sightlines keep the atmosphere calm and unhurried.",
  "The environment shapes the practice. Plants soften the corners, north light steadies the afternoons, and a shared library of references keeps ideas circulating between the people who make them.",
  "Sustainability is not a department here; it is the default. We prototype with offcuts, reuse where we can, and choose materials that age gracefully rather than wear out.",
  "Above all, it is a place for people. Clients, collaborators, and neighbours pass through the same door, and the best decisions still happen over coffee, around the model.",
];

// Scattered fixed slots the images animate within. Cycles for any image count.
// Images shrink to ~42vw on phones so text and its image stay on opposite
// halves (text is capped at 48vw) and never overlap.
const slots = [
  { className: "right-[3vw] top-[8vh] w-[42vw] max-w-[760px] md:w-[64vw]", from: { x: 180, y: 50 }, to: { x: -110, y: -50 } },
  { className: "left-[3vw] top-[10vh] w-[42vw] max-w-[700px] md:w-[58vw]", from: { x: -180, y: 60 }, to: { x: 110, y: -40 } },
  { className: "right-[4vw] bottom-[8vh] w-[42vw] max-w-[740px] md:w-[62vw]", from: { x: 160, y: 80 }, to: { x: -90, y: -70 } },
  { className: "left-[4vw] bottom-[9vh] w-[42vw] max-w-[680px] md:w-[56vw]", from: { x: -160, y: 70 }, to: { x: 90, y: -60 } },
];

// Evaluate a piecewise-linear function at t, holding the end values flat.
function evalPL(ts: number[], vs: number[], t: number) {
  const n = ts.length;
  if (t <= ts[0]) return vs[0];
  if (t >= ts[n - 1]) return vs[n - 1];
  for (let i = 1; i < n; i++) {
    if (t <= ts[i]) {
      const f = (t - ts[i - 1]) / (ts[i] - ts[i - 1]);
      return vs[i - 1] + (vs[i] - vs[i - 1]) * f;
    }
  }
  return vs[n - 1];
}

// Clip a keyframe polyline to the [0,1] scroll domain WAAPI requires, keeping
// the interior breakpoints and sampling the value at the 0/1 boundaries.
function clip(ts: number[], vs: number[]) {
  const off = Array.from(
    new Set([0, 1, ...ts.filter((t) => t > 0 && t < 1)]),
  ).sort((a, b) => a - b);
  return { off, val: off.map((t) => evalPL(ts, vs, t)) };
}

function StoryImage({
  src,
  progress,
  index,
  total,
}: {
  src: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const slot = slots[index % slots.length];
  // Section `index` is centered in the viewport at progress index/(total-1),
  // so anchor the image's peak there. `d` is the gap to the neighbouring
  // sections — the image fades/moves across that gap on either side.
  const d = 1 / Math.max(total - 1, 1);
  const c = index * d;

  // Keep the image tied to its own section: visible only within ±0.5·gap of the
  // centre (the span where its paragraph is the one on screen), so even tall
  // images have fully left by the time the next section takes over.
  const h = d * 0.5;
  const o = clip([c - h, c - h * 0.6, c + h * 0.6, c + h], [0, 1, 1, 0]);
  const mx = clip([c - h, c, c + h], [slot.from.x, 0, slot.to.x]);
  const my = clip([c - h, c, c + h], [slot.from.y, 0, slot.to.y]);
  const ms = clip([c - h, c, c + h], [0.9, 1, 1.06]);

  const opacity = useTransform(progress, o.off, o.val);
  const x = useTransform(progress, mx.off, mx.val);
  const y = useTransform(progress, my.off, my.val);
  const scale = useTransform(progress, ms.off, ms.val);

  return (
    <motion.img
      src={src}
      alt="SHAFE Design Studio office"
      loading="lazy"
      decoding="async"
      style={{ opacity, x, y, scale, filter: "sepia(0.3) saturate(1.05) brightness(0.94)" }}
      className={`pointer-events-none fixed z-0 rounded-xl bg-espresso shadow-2xl ${slot.className}`}
    />
  );
}

export function OfficeStory({ images }: { images: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // +1 for the trailing CTA section below, so the last image has room to
  // exit before the footer reveals.
  const total = paragraphs.length + 1;

  // Scrub the closing CTA's size as it scrolls into view over the last section.
  const ctaScale = useTransform(
    scrollYProgress,
    [(paragraphs.length - 1) / paragraphs.length, 1],
    [0.6, 1],
  );

  return (
    <div className="relative">
      {paragraphs.map((_, i) =>
        images[i] ? (
          <StoryImage key={images[i]} src={images[i]} progress={scrollYProgress} index={i} total={total} />
        ) : null,
      )}

      <div ref={ref}>
        {paragraphs.map((text, i) => (
          <section
            key={i}
            className={`flex h-screen items-center px-5 md:px-16 ${
              i % 2 ? "justify-end" : "justify-start"
            }`}
          >
            <div className="relative z-10 max-w-[48vw] md:max-w-4xl">
              {i === 0 && (
                <>
                  <p className="text-xs uppercase tracking-[0.3em] text-umber">
                    The Studio
                  </p>
                  <h1 className="mb-6 mt-2 text-4xl text-ink md:mb-8 md:text-8xl">Office</h1>
                </>
              )}
              <p className="font-grotesk text-xl font-normal leading-[1.2] tracking-[-0.01em] text-ink md:text-5xl md:leading-[1.15] lg:text-6xl">
                {text}
              </p>
            </div>
          </section>
        ))}
        {/* Closing CTA — scrubbed to grow as it scrolls in, and gives the last
            image room to exit before the footer. */}
        <section className="flex h-screen items-center justify-center px-5 md:px-16">
          <motion.div
            style={{ scale: ctaScale }}
            className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 text-center md:gap-10"
          >
            <h2 className="font-grotesk text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-ink md:text-7xl md:leading-[1.02] lg:text-8xl">
              Let&apos;s design your space.
            </h2>
            <Link
              href="/book"
              className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-terracotta px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-clay"
            >
              Book an initial consultation
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
