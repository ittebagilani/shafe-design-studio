"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "./Reveal";

export function Team() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <div className="mb-12 flex items-end justify-between">
          <h2 className="text-4xl text-ink md:text-5xl">SHAFE Team</h2>
          <a
            href="#contact"
            className="group hidden items-center gap-2 text-sm uppercase tracking-[0.18em] text-umber transition-colors hover:text-terracotta md:inline-flex"
          >
            Meet Everyone
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </Reveal>

      <div
        ref={ref}
        className="relative h-[55vh] min-h-[380px] overflow-hidden rounded-sm bg-espresso"
      >
        <motion.div
          style={{ y }}
          className="absolute inset-x-0 -top-[8%] h-[116%]"
        >
          <Image
            src="/images/office/Office%2001.JPG"
            alt="The SHAFE Design Studio team"
            fill
            sizes="100vw"
            className="object-cover"
            style={{ filter: "sepia(0.28) saturate(1.05) brightness(0.9)" }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
        <p className="absolute bottom-6 left-6 max-w-sm text-sm leading-relaxed text-cream/85 md:bottom-8 md:left-8">
          A close-knit team of designers, architects, and drafters working under
          one roof — from first sketch to permit approval.
        </p>
      </div>
    </section>
  );
}
