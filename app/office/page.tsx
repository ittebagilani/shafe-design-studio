import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { OfficeStory } from "./OfficeStory";

export const metadata: Metadata = { title: "Office — SHAFE" };

const IMG_RE = /\.(jpe?g|png|webp|avif)$/i;

function officeImages() {
  const dir = path.join(process.cwd(), "public", "images", "office");
  return fs
    .readdirSync(dir)
    .filter((f) => IMG_RE.test(f))
    .sort()
    .map((f) => `/images/office/${encodeURIComponent(f)}`);
}

export default function OfficePage() {
  return (
    <div className="grain min-h-screen bg-cream">
      <OfficeStory images={officeImages()} />
    </div>
  );
}
