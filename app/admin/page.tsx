import Link from "next/link";
import { getPosts, readingTime } from "../lib/posts";
import { blobSlugs } from "../lib/blob-posts";
import { deletePostAction, publishDraftAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const all = await getPosts({ includeDrafts: true });
  const drafts = all.filter((p) => p.draft);
  const posts = all.filter((p) => !p.draft);
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

      {drafts.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl text-ink">Pending review</h2>
          <p className="mt-1 text-sm text-umber/70">
            Written automatically. Read it over, then publish or discard.
          </p>
          <ul className="mt-4 divide-y divide-umber/15 rounded-lg border border-umber/15">
            {drafts.map((p) => (
              <li key={p.slug} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-lg text-ink">{p.title}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-umber/70">
                    {p.date} · {readingTime(p)} min
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs uppercase tracking-[0.18em]">
                  <Link href={`/admin/edit/${p.slug}`} className="text-umber hover:text-terracotta">
                    Preview / edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await publishDraftAction(p);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg bg-terracotta px-4 py-2 font-semibold text-cream transition-colors hover:bg-clay"
                    >
                      Publish
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deletePostAction(p.slug);
                    }}
                  >
                    <button type="submit" className="text-terracotta hover:text-clay">
                      Discard
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mt-10 font-display text-xl text-ink">Published</h2>
      <ul className="mt-4 divide-y divide-umber/15">
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
    </div>
  );
}
