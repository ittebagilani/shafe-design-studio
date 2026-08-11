import { cookies } from "next/headers";
import crypto from "node:crypto";

// ponytail: single shared password, no user table. The cookie holds a hash of
// the password (not the password), so it can't be forged without knowing it and
// doesn't leak it. Upgrade to real accounts only if more than one editor needs in.

const COOKIE = "shafe_admin";

function token() {
  return crypto
    .createHash("sha256")
    .update(process.env.ADMIN_PASSWORD ?? "")
    .digest("hex");
}

export function adminConfigured() {
  return !!process.env.ADMIN_PASSWORD;
}

export async function isAuthed() {
  if (!adminConfigured()) return false;
  const c = await cookies();
  return c.get(COOKIE)?.value === token();
}

export async function signIn(password: string) {
  if (!adminConfigured() || password !== process.env.ADMIN_PASSWORD) return false;
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
