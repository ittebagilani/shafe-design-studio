import Link from "next/link";
import { getPosts, readingTime } from "../lib/posts";
import { blobSlugs } from "../lib/blob-posts";
import { deletePostAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const posts = await getPosts();
  const editable = await blobSlugs();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Posts</h1>
        <Link
          href="/admin/new"
          className="rounded-lg bg-terracotta px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-clay"
        >
          New post
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-umber/15">
        {posts.map((p) => {
          const mine = editable.has(p.slug);
          return (
            <li key={p.slug} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-lg text-ink">{p.title}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-umber/70">
                  {p.date} · {readingTime(p)} min{" "}
                  {mine ? (
                    <span className="text-clay">· editable</span>
                  ) : (
                    <span className="text-umber/50">· from code/git</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs uppercase tracking-[0.18em]">
                <Link href={`/blog/${p.slug}`} className="text-umber hover:text-terracotta">
                  View
                </Link>
                <Link href={`/admin/edit/${p.slug}`} className="text-umber hover:text-terracotta">
                  Edit
                </Link>
                {mine && (
                  <form
                    action={async () => {
                      "use server";
                      await deletePostAction(p.slug);
                    }}
                  >
                    <button type="submit" className="text-terracotta hover:text-clay">
                      Delete
                    </button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-sm text-umber/70">
        Posts marked <span className="text-clay">editable</span> are stored in Vercel Blob and can
        be changed here. Posts “from code/git” come from the seed post or the automated draft PRs —
        edit those in the repo (editing one here saves an overriding copy to Blob).
      </p>
    </div>
  );
}
