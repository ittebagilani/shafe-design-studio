import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjects } from "../../lib/portfolio";
import { Reveal } from "../../components/Reveal";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p ? `${p.title} — SHAFE` : "SHAFE" };
}

const imgClass =
  "object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]";
const imgStyle = { filter: "sepia(0.3) saturate(1.05) brightness(0.94)" };

function Tile({
  src,
  alt,
  ratio,
  sizes,
}: {
  src: string;
  alt: string;
  ratio: string;
  sizes: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-espresso ${ratio}`}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className={imgClass} style={imgStyle} />
    </div>
  );
}

// Four distinct galleries. Which one a project gets is fixed by its position in
// the list, so every project reads differently but stays stable across builds.
function Gallery({ images, alt, variant }: { images: string[]; alt: string; variant: number }) {
  if (variant === 0) {
    // Editorial: a wide hero every third tile, the rest paired two-up.
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {images.map((src, i) => {
          const big = i % 3 === 0;
          return (
            <Reveal key={src} delay={(i % 3) * 0.06} className={big ? "col-span-2" : ""}>
              <Tile
                src={src}
                alt={alt}
                ratio={big ? "aspect-[3/2]" : "aspect-[4/5]"}
                sizes={big ? "100vw" : "50vw"}
              />
            </Reveal>
          );
        })}
      </div>
    );
  }

  if (variant === 1) {
    // Masonry: varied-height columns, like the home grid.
    const ratios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[4/3]"];
    return (
      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {images.map((src, i) => (
          <Reveal key={src} className="mb-3 block break-inside-avoid">
            <Tile
              src={src}
              alt={alt}
              ratio={ratios[i % ratios.length]}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Reveal>
        ))}
      </div>
    );
  }

  if (variant === 2) {
    // Bento: a repeating span rhythm across a 6-column grid.
    const spans = ["col-span-6 sm:col-span-4", "col-span-6 sm:col-span-2", "col-span-3", "col-span-3", "col-span-2", "col-span-2", "col-span-2"];
    return (
      <div className="grid grid-cols-6 gap-3 md:gap-4">
        {images.map((src, i) => (
          <Reveal key={src} className={spans[i % spans.length]}>
            <Tile src={src} alt={alt} ratio="aspect-[4/3]" sizes="50vw" />
          </Reveal>
        ))}
      </div>
    );
  }

  // variant 3 — Offset: full-bleed tiles nudged left/right down a single column.
  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {images.map((src, i) => (
        <div key={src} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
          <Reveal from={i % 2 ? "left" : "right"} className="w-full md:w-[74%]">
            <Tile src={src} alt={alt} ratio="aspect-[16/10]" sizes="(max-width: 768px) 100vw, 74vw" />
          </Reveal>
        </div>
      ))}
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = getProjects();
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = all[index];
  const next = all[(index + 1) % all.length];

  return (
    <div className="grain min-h-screen bg-cream">
      <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-28 md:px-8 md:pt-32">
        <Reveal className="mb-10 md:mb-16">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-umber">
            Selected Work — {String(index + 1).padStart(2, "0")}
          </p>
          <h1 className="mt-3 text-4xl text-ink md:text-6xl">{project.name}</h1>
          {project.meta && (
            <p className="mt-3 text-lg text-umber md:text-xl">{project.meta}</p>
          )}
        </Reveal>

        <Gallery images={project.images} alt={project.title} variant={index % 4} />

        <div className="mt-20 flex items-center justify-between border-t border-umber/15 pt-8">
          <span className="text-xs uppercase tracking-[0.2em] text-umber">Next project</span>
          <Link
            href={`/projects/${next.slug}`}
            className="group text-right text-2xl text-ink transition-colors hover:text-umber md:text-3xl"
          >
            {next.name}
            <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
