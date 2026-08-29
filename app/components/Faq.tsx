"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "What services does SHAFE provide for customers looking to construct legal apartments?",
    a: "We handle the full path — from feasibility and zoning review to permit drawings and construction. Our team designs secondary suites and legal basement units that meet your municipality's guidelines and pass inspection.",
  },
  {
    q: "How do I get started?",
    a: "Reach out for a free initial consultation. We'll discuss your space, budget, and timeline, then map out a clear plan and quote before any work begins.",
  },
  {
    q: "What is the typical process for construction and design projects at SHAFE?",
    a: "Every project moves through discovery, concept design, technical drawings and permitting, and finally construction. You'll have a single point of contact throughout, from first sketch to final approval.",
  },
  {
    q: "Do you work on both residential and commercial projects?",
    a: "Yes. Our practice spans custom homes, additions, and interiors as well as commercial fit-outs and development — with the same attention to detail across both.",
  },
];

function Item({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={index * 0.05}>
      <div className="border-b border-umber/20">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-6 py-7 text-left"
        >
          <span className="text-lg text-ink md:text-2xl">{q}</span>
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/25 text-ink transition-transform duration-300"
            style={{ transform: open ? "rotate(45deg)" : "none" }}
          >
            +
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="max-w-2xl pb-7 text-sm leading-relaxed text-umber/80 md:text-base">
                {a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

// Same faqs array as the visible list below — one source of truth, so the
// structured data can't say something different from what's on the page.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function Faq() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-clay">
              Good to know
            </p>
            <h2 className="mt-4 text-4xl leading-[1.05] text-ink md:text-5xl">
              Frequently asked questions
            </h2>
          </Reveal>
        </div>
        <div className="md:col-span-8">
          {faqs.map((f, i) => (
            <Item key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
