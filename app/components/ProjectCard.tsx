"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "../lib/portfolio";

// Cycle of aspect ratios so the masonry stays varied regardless of image count.
const ratios = ["aspect-[3/4]", "aspect-[4/3]", "aspect-[4/5]", "aspect-square"];

const MotionLink = motion.create(Link);

export function ProjectCard({ p, index }: { p: Project; index: number }) {
  return (
    <MotionLink
      href={`/projects/${p.slug}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative mb-2 block break-inside-avoid overflow-hidden rounded-xl bg-espresso"
    >
      <div className={`relative w-full ${ratios[index % ratios.length]}`}>
        <Image
          src={p.cover}
          alt={p.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          style={{ filter: "sepia(0.3) saturate(1.05) brightness(0.94)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-90" />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <div>
            {p.meta && (
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-sand">
                {p.meta}
              </p>
            )}
            <h3 className="text-2xl text-cream">{p.name}</h3>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cream/50 text-cream">
            →
          </span>
        </div>
      </div>
    </MotionLink>
  );
}
