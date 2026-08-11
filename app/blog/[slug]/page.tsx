import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, readingTime, type Block } from "../../lib/posts";
import { Reveal } from "../../components/Reveal";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return post
    ? { title: `${post.title} — SHAFE`, description: post.dek }
    : { title: "SHAFE" };
}

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const imgClass =
  "object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]";
const imgStyle = { filter: "sepia(0.3) saturate(1.05) brightness(0.94)" };

function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-umber/70">
      {text}
    </figcaption>
  );
}

type FigureBlock = Extract<Block, { kind: "full" | "duo" | "offset" }>;

// Each figure block gets a visually distinct layout so the story never reads as
// one image size repeating down the page.
function Figure({ block }: { block: FigureBlock }) {
  if (block.kind === "full") {
    return (
      <Reveal className="my-14 md:my-20">
        <figure>
          <div className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-espresso">
            <Image src={block.src} alt={block.alt} fill sizes="100vw" className={imgClass} style={imgStyle} />
          </div>
          <Caption text={block.caption} />
        </figure>
      </Reveal>
    );
  }

  if (block.kind === "duo") {
    return (
      <Reveal className="my-14 md:my-20">
        <figure>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {block.images.map((im) => (
              <div key={im.src} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-espresso">
                <Image src={im.src} alt={im.alt} fill sizes="50vw" className={imgClass} style={imgStyle} />
              </div>
            ))}
          </div>
          <Caption text={block.caption} />
        </figure>
      </Reveal>
    );
  }

  // offset — a wide tile pushed to one side, breaking the column rhythm.
  return (
    <Reveal from={block.side === "right" ? "left" : "right"} className="my-14 md:my-20">
      <figure className={`flex ${block.side === "right" ? "justify-end" : "justify-start"}`}>
        <div className="w-full md:w-[82%]">
          <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-espresso">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(max-width: 768px) 100vw, 82vw"
              className={imgClass}
              style={imgStyle}
            />
          </div>
          <Caption text={block.caption} />
        </div>
      </figure>
    </Reveal>
  );
}

type ProseBlock = Extract<Block, { kind: "p" | "h2" | "quote" }>;

function Prose({ block }: { block: ProseBlock }) {
  if (block.kind === "h2") {
    return (
      <Reveal className="mx-auto mt-16 max-w-[42rem] md:mt-20">
        <h2 className="font-display text-2xl leading-tight text-ink md:text-3xl">
          {block.text}
        </h2>
      </Reveal>
    );
  }
  if (block.kind === "quote") {
    return (
      <Reveal className="mx-auto my-14 max-w-[46rem] md:my-20">
        <blockquote className="border-l-2 border-terracotta pl-6 font-display text-2xl leading-snug text-clay md:pl-8 md:text-3xl">
          “{block.text}”
          {block.by && (
            <cite className="mt-4 block text-sm not-italic uppercase tracking-[0.2em] text-umber">
              — {block.by}
            </cite>
          )}
        </blockquote>
      </Reveal>
    );
  }
  // paragraph
  return (
    <Reveal className="mx-auto mt-6 max-w-[42rem]">
      <p className="text-lg leading-[1.75] text-umber/90">{block.text}</p>
    </Reveal>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const post = posts[index];
  const next = posts.length > 1 ? posts[(index + 1) % posts.length] : null;

  return (
    <div className="grain min-h-screen bg-cream">
      <main className="pb-24 pt-28 md:pt-32">
        {/* Header */}
        <header className="mx-auto max-w-[46rem] px-5">
          <Reveal>
            <Link
              href="/blog"
              className="text-xs uppercase tracking-[0.2em] text-umber transition-colors hover:text-terracotta"
            >
              ← Blog
            </Link>
            <p className="mt-8 text-[0.7rem] uppercase tracking-[0.3em] text-clay">
              {post.category} · {readingTime(post)} min read · {dateFmt.format(new Date(post.date))}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-umber/80 md:text-xl">
              {post.dek}
            </p>
          </Reveal>
        </header>

        {/* Cover */}
        <Reveal className="mx-auto mt-12 max-w-[1400px] px-4 md:mt-16 md:px-8">
          <div className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-espresso">
            <Image
              src={post.cover}
              alt={post.coverAlt}
              fill
              priority
              sizes="100vw"
              className={imgClass}
              style={imgStyle}
            />
          </div>
        </Reveal>

        {/* Body */}
        <article className="px-5">
          {post.body.map((block, i) => {
            const key = `${block.kind}-${i}`;
            if (block.kind === "full" || block.kind === "duo" || block.kind === "offset") {
              // figures break out of the reading column
              return (
                <div key={key} className="mx-auto max-w-[1200px]">
                  <Figure block={block} />
                </div>
              );
            }
            return <Prose key={key} block={block} />;
          })}
        </article>

        {/* Next */}
        {next && (
          <div className="mx-auto mt-24 max-w-[46rem] px-5">
            <div className="flex items-center justify-between border-t border-umber/15 pt-8">
              <span className="text-xs uppercase tracking-[0.2em] text-umber">Next read</span>
              <Link
                href={`/blog/${next.slug}`}
                className="group text-right text-2xl text-ink transition-colors hover:text-umber md:text-3xl"
              >
                {next.title}
                <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
