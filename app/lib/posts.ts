// ponytail: the seed post lives in code; every post after it is a JSON file in
// content/posts/ (the automated writer drops one there via PR). getPosts()
// merges both. No CMS until one's needed.

import fs from "node:fs";
import path from "node:path";
import { getProject } from "./portfolio";

// ponytail: pick a project photo by a distinctive fragment of its filename
// rather than retyping it. macOS screenshot names hide a U+202F before "PM",
// so hand-copied paths silently 404. Throws at build if the photo is gone.
function pic(slug: string, fragment: string) {
  const hit = getProject(slug)?.images.find((u) =>
    decodeURIComponent(u).includes(fragment),
  );
  if (!hit) throw new Error(`posts.ts: no image matching "${fragment}" in ${slug}`);
  return hit;
}

// A post body is a list of blocks. Text blocks carry the words; figure blocks
// carry the photos + their layout. The renderer in [slug]/page.tsx draws each.
export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "quote"; text: string; by?: string }
  | { kind: "full"; src: string; alt: string; caption?: string }
  | { kind: "duo"; images: { src: string; alt: string }[]; caption?: string }
  | { kind: "offset"; src: string; alt: string; side: "left" | "right"; caption?: string };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  category: string;
  date: string; // ISO
  cover: string;
  coverAlt: string;
  body: Block[];
};

const WPM = 200;

export function readingTime(post: Post): number {
  const words = post.body.reduce((n, b) => {
    if (b.kind === "p" || b.kind === "h2" || b.kind === "quote") {
      return n + b.text.trim().split(/\s+/).length;
    }
    return n;
  }, 0);
  return Math.max(1, Math.round(words / WPM));
}

export const posts: Post[] = [
  {
    slug: "making-one-property-work-harder",
    title: "Making One Property Work Harder",
    dek: "A single lot rarely gives up everything at once. From a custom home to a legal basement suite to a full development, here's how we read a property for every layer of value it can hold — and the services that unlock each one.",
    category: "Field Notes",
    date: "2026-07-24",
    cover: pic("custom-house-oakville-2025", "Back side view-2"),
    coverAlt: "Custom home rear elevation, Oakville",
    body: [
      {
        kind: "p",
        text: "Most people come to us with a single question — can I build this? — and leave with a different, better one: what is this property actually capable of? A lot is never just its footprint. It's a set of overlapping permissions, setbacks, grades, and municipal appetites that, read carefully, describe far more than one owner usually imagines. The work of a design studio is not only to draw a beautiful building. It's to find every layer of value a piece of land is quietly holding, and to sequence the approvals that release them. This is a walk through those layers, and the services that unlock each one.",
      },
      {
        kind: "h2",
        text: "It starts with a house that fits the way you live",
      },
      {
        kind: "p",
        text: "Custom home design is where most projects begin, and it's the one that rewards patience the most. A bespoke home isn't a catalogue plan stretched to fill a lot — it's architecture tailored to how a family actually moves through a day. Where the morning light lands. Whether the kitchen is a thoroughfare or a destination. How a house ages gracefully as the people inside it change. We spend the first weeks of a custom project doing very little drawing and a great deal of listening, because the decisions that matter most — orientation, massing, the relationship between private and shared space — are cheap to change on paper and ruinous to change in framing.",
      },
      {
        kind: "full",
        src: pic("custom-house-oakville-2025", "Main Door.OP-1a"),
        alt: "Custom home entry elevation, Oakville",
        caption: "Custom Home Design — orientation and massing settled long before a single wall is framed.",
      },
      {
        kind: "p",
        text: "By the time a custom home reaches a municipality, the drawings should already answer the questions a plan reviewer is about to ask. Coverage, height, setbacks, servicing — these aren't hurdles cleared at the end. They're constraints designed into the first sketch, which is why our custom homes tend to move through permitting without the redraw-and-resubmit cycle that stalls so many projects.",
      },
      {
        kind: "h2",
        text: "The space you already own, used to its fullest",
      },
      {
        kind: "p",
        text: "Not every property calls for a new house. Just as often, the value is hiding inside the one already standing. Residential additions — a second storey, a rear extension, a reworked main floor — are among the most cost-effective ways to gain the space a growing family needs without the disruption and expense of moving. The craft here is structural honesty: understanding what the existing building can carry, where new loads want to travel, and how to stitch old and new together so the seam disappears. A good addition doesn't read as an addition at all.",
      },
      {
        kind: "duo",
        images: [
          {
            src: pic("residential-additions-milton-2024", "2.42.24"),
            alt: "Residential addition elevation study",
          },
          {
            src: pic("residential-additions-milton-2024", "2.42.46"),
            alt: "Second-storey addition massing render",
          },
        ],
        caption: "Residential Additions, Milton — a second storey stitched to the existing structure until the seam disappears.",
      },
      {
        kind: "p",
        text: "Below grade, the same principle applies. A basement is rarely finished to its potential, and in most of the municipalities we work across it can become a legal secondary suite — an income unit, a space for extended family, or simply room the household has been missing. Legal basement apartments live or die on the details: egress, ceiling height, fire separation, and the specific ceiling of what each municipality's zoning will allow. We design these suites to pass, not to be flagged, which means the code conversation happens at the drawing board rather than at the inspection.",
      },
      {
        kind: "quote",
        text: "A lot is never just its footprint. It's a set of overlapping permissions that, read carefully, describe far more than one owner usually imagines.",
      },
      {
        kind: "h2",
        text: "When the ground rules can be changed",
      },
      {
        kind: "p",
        text: "Sometimes the best use of a property isn't permitted — yet. This is where the work moves from design into advocacy. A minor variance application asks a committee to bend a specific rule: a few feet of setback, a touch more coverage, an extra unit. A rezoning application asks a bigger question, changing what a property is allowed to become. Both are won on the strength of the case, and the case is built long before the hearing — in the drawings, the planning rationale, and a clear-eyed reading of what the municipality is likely to support. We've learned that the applications that succeed are the ones that make the reviewer's job easy: complete, precise, and framed in the municipality's own language.",
      },
      {
        kind: "offset",
        src: pic("additional-residential-unit-aru-mississauga-august-2024", "10.30.53"),
        alt: "Additional Residential Unit layout and site plan",
        side: "right",
        caption: "Additional Residential Unit, Mississauga — a second unit added within the rules, not around them.",
      },
      {
        kind: "p",
        text: "The Additional Residential Unit — the ARU — is where several of these threads come together. New provincial rules have opened the door to more units on lots that used to allow one, and a well-designed ARU can transform a single-family property into a small, legitimate source of income. But 'allowed' and 'approvable' are different words. Getting an ARU built means threading zoning, servicing, parking, and fire code through a single coherent design, and doing it in a way the municipality can say yes to.",
      },
      {
        kind: "h2",
        text: "And when the ambition is bigger than one building",
      },
      {
        kind: "p",
        text: "At the far end of the scale is development — residential and commercial projects where the property is the raw material for something new entirely. Here the studio's role widens from design to coordination: aligning consultants, keeping every requirement tied back to a single vision, and holding the project's intent steady through the long middle where budgets and timelines apply their pressure. A townhouse block, a mixed-use infill, a commercial fit-out — the buildings differ, but the discipline is the same. Decide what the project is trying to be, and refuse to let it drift.",
      },
      {
        kind: "full",
        src: pic("lakeshore-development-burlington-2025", "Oct 20 2025 (1)"),
        alt: "Lakeshore development massing and context render",
        caption: "Lakeshore Development, Burlington — where a property becomes the raw material for something new.",
      },
      {
        kind: "p",
        text: "The through-line across all of it — the custom home, the addition, the legal suite, the variance, the ARU, the development — is that no single service tells the whole story of a property. The lot that arrives as a request for a renovation might, on closer reading, support an income suite that pays for the renovation twice over. The tired bungalow might be a second-storey addition away from being the house the family wanted all along. Our job is to read the whole property before we draw a line, so that the first question — can I build this? — gives way to the one worth answering: what is this land truly capable of, and in what order do we unlock it?",
      },
      {
        kind: "p",
        text: "If you're holding a property and only seeing one use for it, that's usually a sign there's a conversation worth having. Bring us the lot. We'll bring the layers.",
      },
    ],
  },
];

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function diskPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), "utf8")) as Post);
}

// Three sources, later ones win by slug: seed (code) < content/posts (git, from
// the automation) < Blob (the admin UI). Blob import is value-level; posts.ts is
// only a type import there, so there's no runtime cycle.
export async function getPosts(): Promise<Post[]> {
  const { blobPosts } = await import("./blob-posts");
  const bySlug = new Map<string, Post>();
  for (const p of [...posts, ...diskPosts(), ...(await blobPosts())]) {
    bySlug.set(p.slug, p);
  }
  return [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug);
}
