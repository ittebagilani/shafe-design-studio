import fs from "node:fs";
import path from "node:path";

// ponytail: reads public/portfolio from disk at build time — single source of
// truth, no hand-maintained list. Regenerate by just adding/removing folders.

const PORTFOLIO_DIR = path.join(process.cwd(), "public", "portfolio");
const IMG_RE = /\.(jpe?g|png|webp)$/i;

export type Project = {
  slug: string;
  name: string; // first comma segment, e.g. "Custom House"
  meta: string; // remainder, e.g. "Milton · June 2021"
  title: string; // full folder name
  cover: string;
  images: string[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function encodePath(...segs: string[]) {
  return "/" + segs.map(encodeURIComponent).join("/");
}

let cache: Project[] | null = null;

export function getProjects(): Project[] {
  if (cache) return cache;
  cache = fs
    .readdirSync(PORTFOLIO_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const folder = d.name;
      const images = fs
        .readdirSync(path.join(PORTFOLIO_DIR, folder))
        .filter((f) => IMG_RE.test(f))
        .sort()
        .map((f) => encodePath("portfolio", folder, f));
      const [name, ...rest] = folder
        .trim()
        .split(",")
        .map((s) => s.trim());
      return {
        slug: slugify(folder),
        name,
        meta: rest.join(" · "),
        title: folder.trim(),
        cover: images[0],
        images,
      };
    })
    .filter((p) => p.images.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export function getProject(slug: string) {
  return getProjects().find((p) => p.slug === slug);
}

// ponytail: marketing surfaces (hero, discipline tiles, blog art) borrow real
// project photography instead of carrying their own asset set. Reorder to
// re-cast the homepage; falls back to whatever exists if a folder is renamed.
const FEATURED = [
  "custom-house-oakville-2025",
  "lakeshore-development-burlington-2025",
  "retirement-residences-vaughan-2024",
];

export function getFeatured(): Project[] {
  const picked = FEATURED.map(getProject).filter((p) => p !== undefined);
  return picked.length === FEATURED.length
    ? picked
    : getProjects().slice(0, FEATURED.length);
}
