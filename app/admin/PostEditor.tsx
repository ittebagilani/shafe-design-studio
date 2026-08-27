"use client";

import { useEffect, useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import type { Post, Block } from "../lib/posts";
import { PostView } from "../components/PostView";
import { savePostAction, uploadAction } from "./actions";

type IdBlock = Block & { _id: string };

let counter = 0;
const withId = (b: Block): IdBlock => ({ ...b, _id: `b${counter++}` });

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return uploadAction(fd);
}

const input =
  "w-full rounded-lg border border-umber/25 bg-white/70 px-3 py-2 text-ink outline-none focus:border-terracotta";
const label = "block text-xs uppercase tracking-[0.18em] text-umber mb-1";

function ImageField({
  src,
  alt,
  onChange,
}: {
  src: string;
  alt: string;
  onChange: (src: string, alt: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const id = useId();
  return (
    <div className="flex gap-3">
      <label
        htmlFor={id}
        className="relative grid h-24 w-32 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-umber/30 bg-cream text-xs text-umber"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : busy ? (
          "Uploading…"
        ) : (
          "Upload photo"
        )}
        <input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try {
              onChange(await uploadFile(f), alt);
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      <input
        className={input}
        placeholder="Alt text (describe the photo)"
        value={alt}
        onChange={(e) => onChange(src, e.target.value)}
      />
    </div>
  );
}

const NEW_BLOCKS: Record<string, () => Block> = {
  Paragraph: () => ({ kind: "p", text: "" }),
  Heading: () => ({ kind: "h2", text: "" }),
  Quote: () => ({ kind: "quote", text: "" }),
  "Full photo": () => ({ kind: "full", src: "", alt: "", caption: "" }),
  "Two photos": () => ({ kind: "duo", images: [{ src: "", alt: "" }, { src: "", alt: "" }], caption: "" }),
  "Offset photo": () => ({ kind: "offset", src: "", alt: "", side: "right", caption: "" }),
};

export function PostEditor({ initial, isNew }: { initial: Post; isNew: boolean }) {
  const router = useRouter();
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // The preview overlay is `fixed`, but the admin page underneath stays
  // scrollable unless we lock it — otherwise a wheel/trackpad scroll can
  // move either container depending on where the cursor lands.
  useEffect(() => {
    if (!previewing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [previewing]);

  const [title, setTitle] = useState(initial.title);
  const [dek, setDek] = useState(initial.dek);
  const [category, setCategory] = useState(initial.category);
  const [date, setDate] = useState(initial.date);
  const [cover, setCover] = useState(initial.cover);
  const [coverAlt, setCoverAlt] = useState(initial.coverAlt);
  const [blocks, setBlocks] = useState<IdBlock[]>(initial.body.map(withId));

  const setBlock = (i: number, patch: Partial<Block>) =>
    setBlocks((bs) => bs.map((b, j) => (j === i ? ({ ...b, ...patch } as IdBlock) : b)));
  const move = (i: number, d: number) =>
    setBlocks((bs) => {
      const j = i + d;
      if (j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  const remove = (i: number) => setBlocks((bs) => bs.filter((_, j) => j !== i));
  const add = (kind: string) => setBlocks((bs) => [...bs, withId(NEW_BLOCKS[kind]())]);

  function save() {
    setError(null);
    if (!title.trim()) return setError("A title is required.");
    if (!cover) return setError("A cover photo is required.");
    const slug = isNew ? slugify(title) : initial.slug;
    const post: Post = {
      slug,
      title: title.trim(),
      dek,
      category,
      date,
      cover,
      coverAlt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      body: blocks.map(({ _id, ...b }) => b as Block),
    };
    startSave(async () => {
      try {
        await savePostAction(post);
        router.push("/admin");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed.");
      }
    });
  }

  // What PostView would render right now, unsaved — the same shape save()
  // sends to the server, just recomputed on every render instead of on submit.
  const previewPost: Post = {
    slug: initial.slug || "preview",
    title: title.trim(),
    dek,
    category,
    date,
    cover,
    coverAlt,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body: blocks.map(({ _id, ...b }) => b as Block),
  };

  return (
    <div>
      {previewing && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-cream">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-umber/15 bg-cream/95 px-6 py-3 backdrop-blur-sm">
            <span className="text-xs uppercase tracking-[0.18em] text-umber">
              Preview — not yet saved
            </span>
            <button
              onClick={() => setPreviewing(false)}
              className="rounded-lg border border-umber/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-umber transition-colors hover:border-terracotta hover:text-terracotta"
            >
              ← Back to editing
            </button>
          </div>
          <PostView post={previewPost} />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">{isNew ? "New post" : "Edit post"}</h1>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => setPreviewing(true)}
            className="rounded-lg border border-umber/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-umber transition-colors hover:border-terracotta hover:text-terracotta"
          >
            Preview
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-clay disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-terracotta">{error}</p>}

      {/* Meta */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={label}>Title</label>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Dek (short intro under the title)</label>
          <textarea className={input} rows={2} value={dek} onChange={(e) => setDek(e.target.value)} />
        </div>
        <div>
          <label className={label}>Category</label>
          <input className={input} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <label className={label}>Date</label>
          <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Cover photo</label>
          <ImageField src={cover} alt={coverAlt} onChange={(s, a) => { setCover(s); setCoverAlt(a); }} />
        </div>
      </div>

      {/* Body blocks */}
      <h2 className="mt-12 font-display text-2xl text-ink">Body</h2>
      <div className="mt-4 space-y-4">
        {blocks.map((b, i) => (
          <div key={b._id} className="rounded-xl border border-umber/20 bg-white/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-clay">{b.kind}</span>
              <div className="flex items-center gap-3 text-xs text-umber">
                <button onClick={() => move(i, -1)} className="hover:text-terracotta">↑</button>
                <button onClick={() => move(i, 1)} className="hover:text-terracotta">↓</button>
                <button onClick={() => remove(i)} className="text-terracotta hover:text-clay">Remove</button>
              </div>
            </div>

            {(b.kind === "p" || b.kind === "h2" || b.kind === "quote") && (
              <textarea
                className={input}
                rows={b.kind === "p" ? 4 : 2}
                placeholder={b.kind === "h2" ? "Heading" : b.kind === "quote" ? "Pull-quote" : "Paragraph"}
                value={b.text}
                onChange={(e) => setBlock(i, { text: e.target.value })}
              />
            )}

            {(b.kind === "full" || b.kind === "offset") && (
              <div className="space-y-3">
                <ImageField src={b.src} alt={b.alt} onChange={(src, alt) => setBlock(i, { src, alt })} />
                {b.kind === "offset" && (
                  <select
                    className={input}
                    value={b.side}
                    onChange={(e) => setBlock(i, { side: e.target.value as "left" | "right" })}
                  >
                    <option value="right">Aligned right</option>
                    <option value="left">Aligned left</option>
                  </select>
                )}
                <input
                  className={input}
                  placeholder="Caption (optional)"
                  value={b.caption ?? ""}
                  onChange={(e) => setBlock(i, { caption: e.target.value })}
                />
              </div>
            )}

            {b.kind === "duo" && (
              <div className="space-y-3">
                {b.images.map((im, k) => (
                  <ImageField
                    key={k}
                    src={im.src}
                    alt={im.alt}
                    onChange={(src, alt) =>
                      setBlock(i, { images: b.images.map((x, j) => (j === k ? { src, alt } : x)) })
                    }
                  />
                ))}
                <input
                  className={input}
                  placeholder="Caption (optional)"
                  value={b.caption ?? ""}
                  onChange={(e) => setBlock(i, { caption: e.target.value })}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add block */}
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.keys(NEW_BLOCKS).map((k) => (
          <button
            key={k}
            onClick={() => add(k)}
            className="rounded-full border border-umber/25 px-4 py-2 text-sm text-umber transition-colors hover:border-terracotta hover:text-terracotta"
          >
            + {k}
          </button>
        ))}
      </div>
    </div>
  );
}
