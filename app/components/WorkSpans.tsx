"use client";

import { motion } from "motion/react";

const disciplines = ["Interior Design", "Architecture", "Permits & Drawings"];

const statement =
  "We reimagine the built environment, creating spaces that provoke thought, inspire creativity, and build deep connections between people and their surroundings.";

export function WorkSpans({ images }: { images: string[] }) {
  const words = statement.split(" ");
  // Last word finishes at 75% of the pin (60% start + 15% fade), so the full
  // sentence sits fully black for a beat before the section unpins.
  const step = `${60 / (words.length - 1)}%`;

  return (
    <section id="studio">
      {/* Word-by-word scroll reveal — desktop only. Mobile's viewport-height
          instability (address bar show/hide) fights the scroll-driven timeline
          this needs, so mobile gets a plain fade-in instead, in normal flow
          rather than a pinned 240dvh scroll runway that effect no longer needs. */}
      <div className="wordfill-scope relative hidden h-[240dvh] md:block">
        <div className="sticky top-0 flex h-dvh items-center">
          <div className="mx-auto grid w-full max-w-[1600px] items-start gap-10 px-6 md:grid-cols-12 md:px-10">
            <div className="md:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-clay">
                Salman Ellahi
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-umber/60">
                Founder &amp; Principal Designer
              </p>
            </div>
            <h2
              className="font-grotesk md:col-span-8 md:col-start-5 text-3xl font-normal leading-[1.15] tracking-[-0.01em] text-ink md:text-5xl lg:text-6xl"
              style={{ "--step": step } as React.CSSProperties}
            >
              {words.map((word, i) => (
                <span
                  key={i}
                  className="wordfill"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {word}{" "}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pt-20 md:hidden">
        <p className="text-xs uppercase tracking-[0.3em] text-clay">
          Salman Ellahi
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-umber/60">
          Founder &amp; Principal Designer
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-grotesk mt-6 text-3xl font-normal leading-[1.15] tracking-[-0.01em] text-ink"
        >
          {statement}
        </motion.p>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-0">
      <p className="mb-10 font-grotesk text-xl text-ink">
        Our work spans
      </p>

      {/* Expanding gallery: equal by default; hovered item grows, others stay equal. */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start [&:has(.span-item:hover)_.span-item:not(:hover)_h3]:opacity-0">
        {disciplines.map((d, i) => (
            <div
              key={d}
              className="span-item flex flex-col md:min-w-0 md:flex-1 md:basis-0 md:transition-[flex-grow] md:duration-500 md:ease-out md:hover:grow-[2.5]"
            >
              {/* ponytail: background-image (not next/image) so widening the fixed-height
                  box reveals more of the picture at constant scale — expand, no zoom.
                  Landscape source keeps the widened box covered. */}
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-md bg-espresso bg-cover bg-center md:aspect-auto md:h-[62vh] md:bg-[length:auto_100%]"
                style={{ backgroundImage: `url("${images[i % images.length]}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent" />
              </div>
              <h3 className="font-grotesk mt-4 flex items-center gap-2 text-2xl text-ink transition-opacity duration-500 ease-out md:text-3xl">
                {d}
              </h3>
            </div>
        ))}
      </div>
      </div>
    </section>
  );
}
