import { put, list, del } from "@vercel/blob";
import type { Post } from "./posts";

// Posts created/edited in the admin UI live as JSON blobs at posts/<slug>.json;
// uploaded photos live under uploads/. When BLOB_READ_WRITE_TOKEN is unset
// (Blob not provisioned yet), reads return [] and the site falls back to the
// seed post + content/posts — nothing breaks.

const PREFIX = "posts/";

// Pass the token explicitly on every call. With a .vercel project link present,
// the SDK otherwise prefers OIDC (unavailable in local dev) and ignores this
// env var. When the var is unset (e.g. prod on OIDC), token is undefined and the
// SDK resolves credentials itself.
const token = process.env.BLOB_READ_WRITE_TOKEN;

function hasBlob() {
  return !!token;
}

export async function blobPosts(): Promise<Post[]> {
  if (!hasBlob()) return [];
  try {
    const { blobs } = await list({ prefix: PREFIX, token });
    return await Promise.all(
      blobs
        .filter((b) => b.pathname.endsWith(".json"))
        .map(async (b) => {
          const res = await fetch(b.url, { next: { tags: ["posts"] } });
          return (await res.json()) as Post;
        }),
    );
  } catch {
    return [];
  }
}

export async function blobSlugs(): Promise<Set<string>> {
  if (!hasBlob()) return new Set();
  try {
    const { blobs } = await list({ prefix: PREFIX, token });
    return new Set(
      blobs
        .filter((b) => b.pathname.endsWith(".json"))
        .map((b) => b.pathname.slice(PREFIX.length, -".json".length)),
    );
  } catch {
    return new Set();
  }
}

export async function saveBlobPost(post: Post) {
  await put(`${PREFIX}${post.slug}.json`, JSON.stringify(post, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0, // ponytail: origin stays fresh; Next tag-cache does the caching
    token,
  });
}

export async function deleteBlobPost(slug: string) {
  if (!hasBlob()) return;
  const { blobs } = await list({ prefix: `${PREFIX}${slug}.json`, token });
  await Promise.all(blobs.map((b) => del(b.url, { token })));
}

export async function uploadImage(file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const { url } = await put(`uploads/${Date.now()}-${safe}`, file, {
    access: "public",
    token,
  });
  return url;
}
