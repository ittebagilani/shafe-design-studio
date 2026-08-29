import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPosts, readingTime } from "../lib/posts";
import { Reveal } from "../components/Reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Permit timelines, ARU costs, renovation vs. addition, and other real-world questions about building in Ontario, answered by SHAFE Design Studio.",
  alternates: { canonical: "/blog" },
};
export const revalidate = 60;

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function BlogPage() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;

  return (
    <div className="grain min-h-screen bg-cream">
      <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-28 md:px-8 md:pt-32">
        <Reveal className="mb-12 md:mb-16">
          <h1 className="mt-3 text-4xl text-ink md:text-6xl font-medium">From Our Team.</h1>
        </Reveal>

        {lead && (
          <Reveal className="mb-16 md:mb-24">
            <Link href={`/blog/${lead.slug}`} className="group block">
              <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-espresso">
                  <Image
                    src={lead.cover}
                    alt={lead.coverAlt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    style={{ filter: "sepia(0.3) saturate(1.05) brightness(0.94)" }}
                  />
                </div>
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.3em] text-clay">
                    {lead.category} · {readingTime(lead)} min read
                  </p>
                  <h2 className="mt-4 text-3xl leading-[1.08] text-ink md:text-5xl">
                    {lead.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-umber/80 md:text-lg">
                    {lead.dek}
                  </p>
                  <span className="mt-6 inline-block text-sm uppercase tracking-[0.2em] text-terracotta transition-transform group-hover:translate-x-1">
                    Read the story →
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        {rest.length > 0 && (
          <div className="grid gap-x-8 gap-y-12 border-t border-umber/15 pt-12 md:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.08}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-espresso">
                    <Image
                      src={p.cover}
                      alt={p.coverAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      style={{ filter: "sepia(0.3) saturate(1.05) brightness(0.94)" }}
                    />
                  </div>
                  <p className="mt-4 text-[0.7rem] uppercase tracking-[0.3em] text-clay">
                    {p.category} · {readingTime(p)} min read
                  </p>
                  <h3 className="mt-2 text-2xl leading-tight text-ink">{p.title}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        <p className="mt-20 text-xs uppercase tracking-[0.2em] text-umber">
          {dateFmt.format(new Date(lead.date))}
        </p>
      </main>
    </div>
  );
}
