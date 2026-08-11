"use client";

import { useCallback, useEffect, useState } from "react";

// ponytail: a design-review tool, not a product feature. Every knob here writes
// a CSS custom property that Tailwind already reads — `bg-cream` compiles to
// var(--cream), `rounded-3xl` to var(--radius-3xl), `px-6` to var(--spacing) —
// so nine colour inputs restyle every button, card, nav and border on the site
// without a single per-component override.
//
// Fonts load from the Google Fonts v1 CSS API on demand (v1 silently drops
// weights a family lacks; v2 returns a 400 and you get no font at all), so
// nothing is bundled and ordinary visitors pay nothing.
//
// Visible in dev, or anywhere the URL carries ?tweaks — which is also how a
// shared link works: "Copy share link" packs the whole theme into that param.

const SERIF = [
  "Cormorant Garamond", "Cardo", "EB Garamond", "Playfair Display",
  "Libre Baskerville", "Lora", "Crimson Pro", "Spectral", "Source Serif 4",
  "Bodoni Moda", "DM Serif Display", "Instrument Serif", "Fraunces",
  "Newsreader", "Marcellus", "Cinzel", "Italiana", "Gilda Display",
  "Noto Serif Display", "PT Serif", "Petrona", "Young Serif",
];

const SANS = [
  "Manrope", "Inter", "DM Sans", "Work Sans", "Jost", "Outfit",
  "Plus Jakarta Sans", "Space Grotesk", "Archivo", "Karla", "Rubik",
  "Figtree", "Sora", "Public Sans", "Barlow", "Epilogue", "Lexend", "Syne",
  "Chivo", "IBM Plex Sans", "Poppins", "Montserrat", "Raleway",
  "Libre Franklin", "Cabin", "Schibsted Grotesk",
];

const KEY = "shafe-tweaks";

// The nine palette tokens, in the order they read light -> dark. `terracotta`
// is the accent (buttons, links, hovers); `ink` and `espresso` are the dark
// panels; `cream` is the page.
const COLOR_KEYS = [
  ["cream", "Page background"],
  ["creamDeep", "Raised surface"],
  ["sand", "Muted light"],
  ["ochre", "Warm mid"],
  ["terracotta", "Accent / buttons"],
  ["clay", "Accent deep"],
  ["umber", "Body text"],
  ["espresso", "Dark panel"],
  ["ink", "Darkest / headings"],
] as const;

type ColorKey = (typeof COLOR_KEYS)[number][0];
type Palette = Record<ColorKey, string>;

const PRESETS: Record<string, Palette> = {
  Desert: {
    cream: "#f0e8d8", creamDeep: "#e7dcc6", sand: "#d8c39c", ochre: "#c29a5b",
    terracotta: "#b0563a", clay: "#8a4a33", umber: "#4a3423",
    espresso: "#2b2019", ink: "#171310",
  },
  Slate: {
    cream: "#eef1f4", creamDeep: "#e2e7ec", sand: "#c2ccd6", ochre: "#8fa3b5",
    terracotta: "#3f6d8c", clay: "#2f5570", umber: "#2b3947",
    espresso: "#1b232c", ink: "#10161c",
  },
  Olive: {
    cream: "#f1efe4", creamDeep: "#e6e3d3", sand: "#ccc7a6", ochre: "#9aa06a",
    terracotta: "#6b7b45", clay: "#4f5c33", umber: "#3a4128",
    espresso: "#23271a", ink: "#141710",
  },
  Monochrome: {
    cream: "#f7f6f3", creamDeep: "#ecebe7", sand: "#d6d4cd", ochre: "#a8a49a",
    terracotta: "#1a1a1a", clay: "#3a3a3a", umber: "#3f3f3d",
    espresso: "#1e1e1d", ink: "#0b0b0b",
  },
  Rose: {
    cream: "#f5ece7", creamDeep: "#ecdfd8", sand: "#dcc0b3", ochre: "#c4907c",
    terracotta: "#a8503f", clay: "#7d3529", umber: "#4d2b23",
    espresso: "#2b1a16", ink: "#170f0d",
  },
  Nordic: {
    cream: "#f4f4f2", creamDeep: "#e9e9e5", sand: "#d2d2ca", ochre: "#a9a99c",
    terracotta: "#5a6b62", clay: "#3f4d46", umber: "#333b36",
    espresso: "#1f2522", ink: "#121614",
  },
};

type Settings = Palette & {
  displayFont: string;
  displayWeight: number;
  displayTracking: number; // em
  displayLeading: number; // unitless
  bodyFont: string;
  bodyWeight: number;
  bodyTracking: number;
  bodyLeading: number;
  radius: number; // multiplier on Tailwind's --radius-* scale
  density: number; // multiplier on --spacing, i.e. all padding/margin/gap
  grain: number; // opacity of the noise overlay
};

const DEFAULTS: Settings = {
  ...PRESETS.Desert,
  displayFont: "Cormorant Garamond",
  displayWeight: 400,
  displayTracking: 0,
  displayLeading: 1.1,
  bodyFont: "Manrope",
  bodyWeight: 400,
  bodyTracking: 0,
  bodyLeading: 1.6,
  radius: 1,
  density: 1,
  grain: 0.04,
};

// Tailwind's stock radius scale, in rem. The slider scales all of them at once
// so the size hierarchy between a pill and a hero card survives.
const RADII: Record<string, number> = {
  sm: 0.25, md: 0.375, lg: 0.5, xl: 0.75, "2xl": 1, "3xl": 1.5, "4xl": 2,
};

function toVars(s: Settings): Record<string, string> {
  const vars: Record<string, string> = {
    "--cream": s.cream,
    "--cream-deep": s.creamDeep,
    "--sand": s.sand,
    "--ochre": s.ochre,
    "--terracotta": s.terracotta,
    "--clay": s.clay,
    "--umber": s.umber,
    "--espresso": s.espresso,
    "--ink": s.ink,
    "--spacing": `${0.25 * s.density}rem`,
    "--tweak-grain": String(s.grain),
    "--tweak-display-font": `"${s.displayFont}"`,
    "--tweak-display-weight": String(s.displayWeight),
    "--tweak-display-tracking": `${s.displayTracking}em`,
    "--tweak-display-leading": String(s.displayLeading),
    "--tweak-body-font": `"${s.bodyFont}"`,
    "--tweak-body-weight": String(s.bodyWeight),
    "--tweak-body-tracking": `${s.bodyTracking}em`,
    "--tweak-body-leading": String(s.bodyLeading),
  };
  for (const [name, rem] of Object.entries(RADII)) {
    vars[`--radius-${name}`] = `${(rem * s.radius).toFixed(3)}rem`;
  }
  return vars;
}

function loadFont(family: string) {
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css?family=${family.replace(
    /\s+/g,
    "+",
  )}:300,400,500,600,700&display=swap`;
  document.head.appendChild(link);
}

function apply(s: Settings) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(toVars(s))) root.style.setProperty(k, v);
  root.setAttribute("data-tweaks", "");
  loadFont(s.displayFont);
  loadFont(s.bodyFont);
}

function persist(s: Settings) {
  localStorage.setItem(KEY, JSON.stringify({ settings: s, vars: toVars(s) }));
}

function encode(s: Settings) {
  return encodeURIComponent(btoa(JSON.stringify(s)));
}

function decode(raw: string): Settings | null {
  try {
    return { ...DEFAULTS, ...JSON.parse(atob(decodeURIComponent(raw))) };
  } catch {
    return null;
  }
}

function cssSnippet(s: Settings) {
  return `/* Paste into app/globals.css. Load these two families with next/font
   in app/layout.tsx, then delete <Tweaks /> and this panel's CSS block. */
:root {
  --cream: ${s.cream};
  --cream-deep: ${s.creamDeep};
  --sand: ${s.sand};
  --ochre: ${s.ochre};
  --terracotta: ${s.terracotta};
  --clay: ${s.clay};
  --umber: ${s.umber};
  --espresso: ${s.espresso};
  --ink: ${s.ink};
  --spacing: ${(0.25 * s.density).toFixed(4)}rem;
}

@theme inline {
${Object.entries(RADII)
  .map(([n, rem]) => `  --radius-${n}: ${(rem * s.radius).toFixed(3)}rem;`)
  .join("\n")}
}

.grain::before { opacity: ${s.grain}; }

:is(h1, h2, h3, h4, h5, h6, .font-display) {
  font-family: "${s.displayFont}", Georgia, serif;
  font-weight: ${s.displayWeight};
  letter-spacing: ${s.displayTracking}em;
  line-height: ${s.displayLeading};
}

body {
  font-family: "${s.bodyFont}", Helvetica, Arial, sans-serif;
  font-weight: ${s.bodyWeight};
  letter-spacing: ${s.bodyTracking}em;
  line-height: ${s.bodyLeading};
}`;
}

export function Tweaks() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"color" | "type" | "layout">("color");
  const [s, setS] = useState<Settings>(DEFAULTS);
  // Whether the overrides are switched on at all. Starts off so that merely
  // opening the site in dev doesn't restyle it — the defaults here can't
  // reproduce the hand-tuned per-heading leading the real design uses.
  const [active, setActive] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const param = new URLSearchParams(location.search).get("tweaks");
    setVisible(process.env.NODE_ENV === "development" || param !== null);

    // A shared link wins over whatever this browser had saved, and is persisted
    // straight away so the theme survives navigating to another page.
    const fromUrl = param ? decode(param) : null;
    if (fromUrl) {
      setS(fromUrl);
      setActive(true);
      persist(fromUrl);
      return;
    }
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setS({ ...DEFAULTS, ...JSON.parse(raw).settings });
        setActive(true);
      }
    } catch {}
  }, []);

  // Live preview: every change repaints the whole site immediately.
  useEffect(() => {
    if (!visible) return;
    if (active) return apply(s);
    const root = document.documentElement;
    for (const k of Object.keys(toVars(s))) root.style.removeProperty(k);
    root.removeAttribute("data-tweaks");
  }, [s, active, visible]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }, []);

  if (!visible) return null;

  // Touching any control switches the overrides on.
  const edit = (patch: Partial<Settings>) => {
    setActive(true);
    setS((p) => ({ ...p, ...patch }));
  };
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    edit({ [k]: v } as Partial<Settings>);

  const shareLink = () => {
    const url = `${location.origin}${location.pathname}?tweaks=${encode(s)}`;
    navigator.clipboard.writeText(url);
    flash("Link copied — send it to anyone");
  };

  const reset = () => {
    localStorage.removeItem(KEY);
    setS(DEFAULTS);
    setActive(false);
    flash("Back to the original design");
  };

  return (
    // The panel is built out of the same Tailwind utilities it is busy
    // rewriting, so it pins the vars it drives back to stock values for its own
    // subtree — otherwise dragging Density resizes the sliders you're dragging.
    // `data-tweaks-ui` keeps the type overrides out of here too (see globals.css).
    <div
      data-tweaks-ui
      style={
        {
          "--spacing": "0.25rem",
          ...Object.fromEntries(
            Object.entries(RADII).map(([n, rem]) => [`--radius-${n}`, `${rem}rem`]),
          ),
        } as React.CSSProperties
      }
      className="fixed bottom-4 right-4 z-[999] font-sans text-[12px] text-white"
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-black/85 px-4 py-2 uppercase tracking-[0.2em] shadow-lg backdrop-blur"
        >
          Design
        </button>
      )}

      {open && (
        <div className="flex max-h-[86vh] w-[310px] flex-col rounded-xl bg-black/90 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between px-4 pt-4">
            <span className="uppercase tracking-[0.2em] opacity-70">Design</span>
            <button onClick={() => setOpen(false)} className="opacity-70">
              ✕
            </button>
          </div>

          <div className="mt-3 flex gap-1 px-4">
            {(["color", "type", "layout"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded py-1.5 capitalize ${
                  tab === t ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {tab === "color" && (
              <>
                <p className="mb-2 uppercase tracking-[0.2em] opacity-50">
                  Presets
                </p>
                <div className="mb-5 grid grid-cols-2 gap-1.5">
                  {Object.entries(PRESETS).map(([name, p]) => (
                    <button
                      key={name}
                      onClick={() => edit(p)}
                      className="flex items-center gap-2 rounded border border-white/15 px-2 py-1.5 text-left"
                    >
                      <span className="flex shrink-0">
                        {[p.cream, p.terracotta, p.ink].map((c) => (
                          <span
                            key={c}
                            className="h-3 w-3 rounded-full border border-black/30"
                            style={{ backgroundColor: c, marginRight: -4 }}
                          />
                        ))}
                      </span>
                      <span className="truncate opacity-80">{name}</span>
                    </button>
                  ))}
                </div>

                <p className="mb-2 uppercase tracking-[0.2em] opacity-50">
                  Palette
                </p>
                {COLOR_KEYS.map(([key, label]) => (
                  <label
                    key={key}
                    className="mb-1.5 flex items-center justify-between gap-2"
                  >
                    <span className="opacity-70">{label}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono opacity-40">{s[key]}</span>
                      <input
                        type="color"
                        value={s[key]}
                        onChange={(e) => set(key, e.target.value)}
                        className="h-6 w-8 cursor-pointer rounded border border-white/20 bg-transparent"
                      />
                    </span>
                  </label>
                ))}
              </>
            )}

            {tab === "type" && (
              <>
                <Group label="Headings">
                  <FontPicker
                    value={s.displayFont}
                    onChange={(v) => set("displayFont", v)}
                  />
                  <Slider label="Weight" value={s.displayWeight} min={300} max={700} step={100} onChange={(v) => set("displayWeight", v)} />
                  <Slider label="Letter spacing" value={s.displayTracking} min={-0.05} max={0.3} step={0.005} suffix="em" onChange={(v) => set("displayTracking", v)} />
                  <Slider label="Line height" value={s.displayLeading} min={0.85} max={2} step={0.01} onChange={(v) => set("displayLeading", v)} />
                </Group>
                <Group label="Body">
                  <FontPicker
                    value={s.bodyFont}
                    onChange={(v) => set("bodyFont", v)}
                  />
                  <Slider label="Weight" value={s.bodyWeight} min={300} max={700} step={100} onChange={(v) => set("bodyWeight", v)} />
                  <Slider label="Letter spacing" value={s.bodyTracking} min={-0.03} max={0.2} step={0.005} suffix="em" onChange={(v) => set("bodyTracking", v)} />
                  <Slider label="Line height" value={s.bodyLeading} min={1} max={2.4} step={0.01} onChange={(v) => set("bodyLeading", v)} />
                </Group>
                <p className="leading-snug opacity-45">
                  The SHAFE wordmark keeps its own face and is left alone.
                </p>
              </>
            )}

            {tab === "layout" && (
              <>
                <Group label="Shape">
                  <Slider label="Corner rounding" value={s.radius} min={0} max={2.5} step={0.05} suffix="×" onChange={(v) => set("radius", v)} />
                </Group>
                <Group label="Space">
                  <Slider label="Density" value={s.density} min={0.7} max={1.5} step={0.01} suffix="×" onChange={(v) => set("density", v)} />
                  <p className="leading-snug opacity-45">
                    Scales every padding, margin and gap at once — lower is
                    tighter, higher is more airy.
                  </p>
                </Group>
                <Group label="Texture">
                  <Slider label="Grain" value={s.grain} min={0} max={0.14} step={0.005} onChange={(v) => set("grain", v)} />
                </Group>
              </>
            )}
          </div>

          <div className="border-t border-white/15 p-4">
            <button
              onClick={() => {
                persist(s);
                flash("Applied across the whole site");
              }}
              className="w-full rounded bg-white py-2 font-medium uppercase tracking-[0.15em] text-black"
            >
              Apply site-wide
            </button>
            <div className="mt-2 flex gap-2">
              <button
                onClick={shareLink}
                className="flex-1 rounded border border-white/25 py-1.5"
              >
                Copy share link
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cssSnippet(s));
                  flash("CSS copied");
                }}
                className="flex-1 rounded border border-white/25 py-1.5"
              >
                Copy CSS
              </button>
              <button
                onClick={reset}
                className="rounded border border-white/25 px-3"
              >
                Reset
              </button>
            </div>
            <p className="mt-2 h-4 text-center opacity-60">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 uppercase tracking-[0.2em] opacity-50">{label}</p>
      {children}
    </div>
  );
}

function FontPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mb-3 w-full rounded border border-white/20 bg-black px-2 py-1.5"
    >
      <optgroup label="Serif">
        {SERIF.map((f) => (
          <option key={f}>{f}</option>
        ))}
      </optgroup>
      <optgroup label="Sans">
        {SANS.map((f) => (
          <option key={f}>{f}</option>
        ))}
      </optgroup>
    </select>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mb-2 block">
      <span className="flex justify-between opacity-60">
        {label}
        <span>
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-white"
      />
    </label>
  );
}
