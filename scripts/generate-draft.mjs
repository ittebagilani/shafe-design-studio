// Generates one blog post targeting the next topic in rotation and saves it
// to Vercel Blob as a draft (same posts/<slug>.json shape the admin UI uses,
// with draft: true). It shows up in /admin under "Pending review" — publish or
// discard from there. Run locally (`npm run blog:draft`) or from CI.
//
// Posts are general-inquiry / FAQ content (permits, ARUs, budgets, process —
// the things prospective clients actually ask), not project write-ups: the
// model is told not to narrate any photo as a specific past project or client.
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

// Topics prospective clients actually ask about, grounded in the studio's
// real services (app/components/Services.tsx) and the municipalities it
// works in (app/components/Municipalities.tsx) — but framed as general
// inquiries, not a write-up of any particular job.
const TOPICS = [
  "How long a building permit actually takes in Ontario, and what slows it down",
  "Renovation vs. addition: which permit path applies and why it matters for cost",
  "Legal basement suites (ARUs): what qualifies, what it costs, and what trips people up",
  "Minor variance vs. rezoning application: what's the difference and when each is needed",
  "What an architect does that a designer doesn't, and when you need which",
  "Custom home vs. major renovation: how to actually decide between the two",
  "What to budget for permit drawings and approvals before construction starts",
  "How the process differs by municipality — Oakville, Burlington, Milton, Mississauga, Hamilton, Peterborough",
  "Site plan approval: what triggers it and how long it realistically adds",
  "What a first consultation with a design studio should cover",
];

function enc(folder, file) {
  return "/" + ["portfolio", folder, file].map(encodeURIComponent).join("/");
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// A broad, unfiltered sample across every portfolio folder — these posts
// aren't about any one project, so the pool isn't matched to a topic, just
// varied enough that the model can pick fitting general texture.
function imagePool() {
  const folders = fs.readdirSync(PORTFOLIO, { withFileTypes: true }).filter((d) => d.isDirectory());
  const pick = (folder) =>
    fs
      .readdirSync(path.join(PORTFOLIO, folder.name))
      .filter((f) => IMG_RE.test(f))
      .slice(0, 2)
      .map((f) => enc(folder.name, f));
  return folders.flatMap(pick).slice(0, 20);
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
  const topic = TOPICS[blobs.length % TOPICS.length];
  const images = imagePool();
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

Write ONE general-inquiry post answering: "${topic}"

This is educational content for someone researching before they've hired anyone — not a project write-up. Draw on the studio's real expertise and service area, but:
- Never say "we recently completed," "this project," "one of our clients," or otherwise imply the piece describes specific past work.
- Photos are illustrative texture only (a home exterior, a construction detail, an interior) — caption them generically (e.g. "A custom addition mid-construction"), never as if they document the specific case being discussed.
- Answer the question directly and concretely — real numbers, real timelines, real trade-offs — rather than vague reassurance.

Rules:
- At least 4 minutes to read (~900+ words across the text blocks).
- Use a varied structure: several "p" paragraphs, 2-3 "h2" headings, one "quote", and 3-4 figure blocks (mix of "full", "duo", and "offset" — do not repeat one figure type).
- Every image src/alt MUST be chosen from the provided photo list; pick photos that suit the surrounding text.
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
  console.log(`Saved draft "${record.title}" (topic: ${topic}) — review it in /admin.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
