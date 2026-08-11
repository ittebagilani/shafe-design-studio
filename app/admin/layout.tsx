import type { ReactNode } from "react";
import Link from "next/link";
import { isAuthed, adminConfigured } from "../lib/admin-auth";
import { logoutAction } from "./actions";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic"; // cookie- and Blob-driven; never cache admin

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!adminConfigured()) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-3xl text-ink">Admin not configured</h1>
          <p className="mt-4 text-umber/80">
            Set an <code className="rounded bg-cream-deep px-1.5 py-0.5">ADMIN_PASSWORD</code>{" "}
            environment variable (and add the Vercel Blob integration for{" "}
            <code className="rounded bg-cream-deep px-1.5 py-0.5">BLOB_READ_WRITE_TOKEN</code>),
            then reload.
          </p>
        </div>
      </div>
    );
  }

  if (!(await isAuthed())) return <LoginForm />;

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-umber/15 px-6 py-4 md:px-10">
        <Link href="/admin" className="font-display text-xl text-ink">
          SHAFE <span className="text-clay">Admin</span>
        </Link>
        <div className="flex items-center gap-5 text-xs uppercase tracking-[0.18em] text-umber">
          <Link href="/blog" className="hover:text-terracotta">
            View blog
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="hover:text-terracotta">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10 md:px-10">{children}</main>
    </div>
  );
}
