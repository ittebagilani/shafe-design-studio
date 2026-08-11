"use client";

import { Reveal } from "./Reveal";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "../lib/portfolio";

export function FeaturedWorks({ projects }: { projects: Project[] }) {
  return (
    <section
      id="projects"
      className="mx-auto max-w-[1600px] px-4 py-20 md:px-6 md:py-28"
    >
      <Reveal>
        <h2 className="mb-8 text-4xl text-ink md:text-5xl">
          Featured Works
        </h2>
      </Reveal>

      <div className="columns-1 gap-2 sm:columns-2 lg:columns-3">
        {projects.slice(0, 9).map((p, i) => (
          <ProjectCard key={p.slug} p={p} index={i} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href="/projects"
          className="group inline-flex items-center gap-2 rounded-full bg-ink/[0.06] px-6 py-3 text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink/[0.12]"
        >
          All Work
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>

      <hr className="mx-auto mt-16 max-w-[1600px] border-umber/15" />
    </section>
  );
}
