"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

const places = [
  "Oakville",
  "Burlington",
  "Milton",
  "Peterborough",
  "Mississauga",
  "Hamilton",
];

export function Municipalities() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-clay">
          Where we build
        </p>
        <h2 className="mt-4 max-w-2xl text-4xl leading-[1.05] text-ink md:text-5xl">
          Municipalities we work with
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-umber/15 bg-umber/15 sm:grid-cols-3">
        {places.map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="flex items-center justify-center bg-cream px-6 py-12 text-center transition-colors duration-300 hover:bg-cream-deep"
          >
            <span className="font-display text-2xl text-ink md:text-3xl">{p}</span>
          </motion.div>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="mt-8 text-center text-sm uppercase tracking-[0.25em] text-umber/60">
          And many more
        </p>
      </Reveal>
    </section>
  );
}
