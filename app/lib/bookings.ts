import { put, list } from "@vercel/blob";

// Confirmed slots live as JSON blobs at bookings/<date>.json — a plain array
// of the taken time-slot strings for that day. Same graceful fallback as
// blob-posts.ts: with no BLOB_READ_WRITE_TOKEN, booking still works, it just
// can't check or reserve anything.

const PREFIX = "bookings/";
const token = process.env.BLOB_READ_WRITE_TOKEN;

function hasBlob() {
  return !!token;
}

function keyFor(date: string) {
  return `${PREFIX}${date}.json`;
}

export async function bookedSlots(date: string): Promise<string[]> {
  if (!hasBlob() || !date) return [];
  try {
    const { blobs } = await list({ prefix: keyFor(date), token });
    const hit = blobs.find((b) => b.pathname === keyFor(date));
    if (!hit) return [];
    const res = await fetch(hit.url, { cache: "no-store" });
    return (await res.json()) as string[];
  } catch {
    return [];
  }
}

// Reserves a slot if it isn't already taken. Returns false if someone beat
// you to it. Read-then-write, not a transaction — but at consultation-call
// volume the collision window is a non-issue; a lock/queue would be solving
// a problem this booking form doesn't have.
export async function reserveSlot(date: string, slot: string): Promise<boolean> {
  if (!hasBlob()) return true;
  const existing = await bookedSlots(date);
  if (existing.includes(slot)) return false;
  await put(keyFor(date), JSON.stringify([...existing, slot]), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
    token,
  });
  return true;
}
