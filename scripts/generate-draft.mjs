// Generates one blog post targeting the next service in rotation and saves it
// to Vercel Blob as a draft (same posts/<slug>.json shape the admin UI uses,
// with draft: true). It shows up in /admin under "Pending review" — publish or
// discard from there. Run locally (`npm run blog:draft`) or from CI.
//
// Needs ANTHROPIC_API_KEY and BLOB_READ_WRITE_TOKEN. ponytail: no CMS, no queue
// table — a Blob JSON file with draft:true IS the draft; the admin UI is the
// approval gate.

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { put, list } from "@vercel/blob";

const ROOT = process.cwd();
const PORTFOLIO = path.join(ROOT, "public", "portfolio");
const BLOB_PREFIX = "posts/";
const IMG_RE = /\.(jpe?g|png|webp)$/i;

// Services we rotate through, each with the portfolio folders whose photos suit
// it. Keep in sync with app/components/Services.tsx.
const SERVICES = [
  { name: "Custom Home Design", match: /custom house/i },
  { name: "Residential Additions", match: /addition|renovation/i },
  { name: "Basements & Legal Suites (ARUs)", match: /aru|additional residential/i },
  { name: "Development (Residential & Commercial)", match: /development|triplex|townhouse|commercial/i },
  { name: "Rezoning & Minor Variance Applications", match: /development|extension|addition/i },
  { name: "Interior Design & Renovations", match: /renovation|salon|clinic|restaurant|dental/i },
];

function enc(folder, file) {
  return "/" + ["portfolio", folder, file].map(encodeURIComponent).join("/");
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Build an image pool: photos from folders matching the service, topped up with
// others so the model always has variety. Returned as encoded /portfolio/... URLs.
function imagePool(service) {
  const folders = fs.readdirSync(PORTFOLIO, { withFileTypes: true }).filter((d) => d.isDirectory());
  const pick = (folder) =>
    fs
      .readdirSync(path.join(PORTFOLIO, folder.name))
      .filter((f) => IMG_RE.test(f))
      .slice(0, 2)
      .map((f) => enc(folder.name, f));
  const matched = folders.filter((d) => service.match.test(d.name)).flatMap(pick);
  const rest = folders.filter((d) => !service.match.test(d.name)).flatMap(pick);
  return [...matched, ...rest].slice(0, 16);
}

function bodySchema(imageEnum) {
  const caption = { type: "string" };
  const imgObj = {
    type: "object",
    additionalProperties: false,
    properties: { src: { type: "string", enum: imageEnum }, alt: { type: "string" } },
    required: ["src", "alt"],
  };
  return {
    type: "array",
    items: {
      anyOf: [
        { type: "object", additionalProperties: false, properties: { kind: { const: "p" }, text: { type: "string" } }, required: ["kind", "text"] },
        { type: "object", additionalProperties: false, properties: { kind: { const: "h2" }, text: { type: "string" } }, required: ["kind", "text"] },
        { type: "object", additionalProperties: false, properties: { kind: { const: "quote" }, text: { type: "string" } }, required: ["kind", "text"] },
        { type: "object", additionalProperties: false, properties: { kind: { const: "full" }, src: { type: "string", enum: imageEnum }, alt: { type: "string" }, caption }, required: ["kind", "src", "alt"] },
        { type: "object", additionalProperties: false, properties: { kind: { const: "duo" }, images: { type: "array", items: imgObj }, caption }, required: ["kind", "images"] },
        { type: "object", additionalProperties: false, properties: { kind: { const: "offset" }, src: { type: "string", enum: imageEnum }, alt: { type: "string" }, side: { enum: ["left", "right"] }, caption }, required: ["kind", "src", "side", "alt"] },
      ],
    },
  };
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set.");

  const { blobs } = await list({ prefix: BLOB_PREFIX, token });
  const service = SERVICES[blobs.length % SERVICES.length];
  const images = imagePool(service);
  if (images.length < 4) throw new Error("Not enough portfolio images to build a post.");

  const client = new Anthropic();
  const res = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            dek: { type: "string" },
            category: { type: "string" },
            coverSrc: { type: "string", enum: images },
            coverAlt: { type: "string" },
            body: bodySchema(images),
          },
          required: ["title", "dek", "category", "coverSrc", "coverAlt", "body"],
        },
      },
    },
    messages: [
      {
        role: "user",
        content: `You write the blog for SHAFE, an Ontario architecture & design studio (custom homes, additions, legal basement suites/ARUs, development, rezoning). Warm, editorial, concrete — never salesy or listy.

Write ONE post that leads with the service "${service.name}" while weaving in the studio's other services where natural.

Rules:
- At least 4 minutes to read (~900+ words across the text blocks).
- Use a varied structure: several "p" paragraphs, 2-3 "h2" headings, one "quote", and 3-4 figure blocks (mix of "full", "duo", and "offset" — do not repeat one figure type).
- Every image src/alt MUST be chosen from the provided photo list; pick photos that suit the surrounding text. Give each a short factual caption.
- "category" should be a short section label like "Field Notes" or "Design Notes".
- Do not invent image paths.`,
      },
    ],
  });

  const jsonBlock = res.content.find((b) => b.type === "text");
  if (!jsonBlock) throw new Error("No text output from model.");
  const post = JSON.parse(jsonBlock.text);

  const slug = slugify(post.title);
  const record = {
    slug,
    title: post.title,
    dek: post.dek,
    category: post.category,
    date: new Date().toISOString().slice(0, 10),
    cover: post.coverSrc,
    coverAlt: post.coverAlt,
    body: post.body,
    draft: true,
  };

  await put(`${BLOB_PREFIX}${slug}.json`, JSON.stringify(record, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
    token,
  });
  console.log(`Saved draft "${record.title}" (service: ${service.name}) — review it in /admin.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
