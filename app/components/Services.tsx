"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

const core = [
  {
    no: "01",
    name: "Custom Home Design",
    copy: "Bespoke, personalised architecture tailored to your vision and the way you live — turning raw space into a home that lasts.",
  },
  {
    no: "02",
    name: "Development",
    copy: "End-to-end services across residential and commercial projects, keeping every requirement aligned to the overall vision.",
  },
  {
    no: "03",
    name: "Basements & Apartments",
    copy: "Legal basement units and secondary suites built to your needs and to each municipality's guidelines — space used to its fullest.",
  },
  {
    no: "04",
    name: "Residential Additions",
    copy: "Expert guidance on purpose-built additions and second-storey extensions, planned to make the most of the space you already have.",
  },
];

const other = [
  "Rezoning Applications",
  "Minor Variance Applications",
  "Interior Design",
  "3D Modelling",
  "Heritage Building Restoration",
  "Site Plan Approvals",
  "GADD Services",
  "Construction Financing",
  "Renovations & Alterations",
];

export function Services() {
  return (
    <section
      id="services"
      className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="grid items-start gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-clay">
              What we do
            </p>
            <h2 className="mt-4 text-4xl leading-[1.05] text-ink md:text-5xl lg:text-6xl">
              Our Services
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-x-12 gap-y-12 md:col-span-8 md:grid-cols-2">
          {core.map((s, i) => (
            <Reveal key={s.no} delay={(i % 2) * 0.08}>
              <div className="border-t border-umber/20 pt-6">
                <span className="font-display text-sm text-clay">{s.no}</span>
                <h3 className="mt-2 text-2xl text-ink md:text-3xl">{s.name}</h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-umber/80">
                  {s.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-24 text-center md:mt-32">
        <Reveal>
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-clay">
            Other Services
          </p>
        </Reveal>
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
          {other.map((label, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.55,
                delay: i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-full border border-umber/25 px-5 py-2.5 text-sm text-umber transition-colors duration-300 hover:border-terracotta hover:bg-terracotta hover:text-cream"
            >
              {label}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
