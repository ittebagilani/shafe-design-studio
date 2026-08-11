import type { Metadata } from "next";
import { getProjects } from "../lib/portfolio";
import { ProjectCard } from "../components/ProjectCard";
import { Reveal } from "../components/Reveal";

export const metadata: Metadata = { title: "All Work — SHAFE" };

export default function AllWorkPage() {
  const projects = getProjects();
  return (
    <div className="grain min-h-screen bg-cream">
      <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-28 md:px-8 md:pt-32">
        <Reveal className="mb-10 md:mb-16">
          <h1 className="mt-3 text-4xl text-ink md:text-6xl">All Work</h1>
        </Reveal>

        <div className="columns-1 gap-2 sm:columns-2 lg:columns-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} p={p} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
