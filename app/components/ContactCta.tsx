"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function ContactCta({ invert = false }: { invert?: boolean }) {
  return (
    <section
      id={invert ? undefined : "contact"}
      className="mx-auto max-w-[1600px] px-6 py-20 md:px-10 md:py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        data-nav-dark={invert ? undefined : true}
        className={`flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl px-8 py-14 md:flex-row md:items-center md:px-14 md:py-16 ${
          invert
            ? "border border-umber/20 bg-cream-deep text-ink"
            : "bg-ink text-cream"
        }`}
      >
        <div>
          <p
            className={`text-xs uppercase tracking-[0.3em] ${
              invert ? "text-clay" : "text-sand"
            }`}
          >
            Free of charge
          </p>
          <h2 className="mt-3 max-w-xl text-3xl leading-[1.1] md:text-5xl">
            Start with an initial consultation.
          </h2>
          <p
            className={`mt-4 max-w-md text-sm leading-relaxed ${
              invert ? "text-umber/80" : "text-cream/70"
            }`}
          >
            Sit down with our team to talk through your space, budget, and
            timeline — no commitment, just a clear next step.
          </p>
        </div>
        <Link
          href="/book"
          className={`group inline-flex shrink-0 items-center gap-3 rounded-full px-8 py-4 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-terracotta hover:text-cream ${
            invert ? "bg-ink text-cream" : "bg-cream text-ink"
          }`}
        >
          Book Now
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </motion.div>
    </section>
  );
}
