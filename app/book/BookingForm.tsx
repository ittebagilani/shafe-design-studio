"use client";

import { useActionState, useRef, useState } from "react";
import { motion } from "motion/react";
import { submitBooking, type BookingState } from "./actions";

type Step = {
  name: string;
  no: string;
  prompt: string;
  hint?: string;
  type: "text" | "email" | "tel" | "date" | "textarea" | "slots" | "choice";
  options?: { value: string; note?: string }[];
  /** Adds an "Other" button that swaps in a free-text line. */
  other?: string;
  required?: boolean;
};

const STEPS: Step[] = [
  {
    name: "call",
    no: "01",
    prompt: "Which call would you like?",
    type: "choice",
    required: true,
    options: [
      { value: "Quick 15 min intro call", note: "About anything" },
      { value: "45 min full consult", note: "About the project and next steps" },
    ],
  },
  { name: "name", no: "02", prompt: "Name", type: "text", required: true },
  { name: "email", no: "03", prompt: "Email", type: "email", required: true },
  { name: "phone", no: "04", prompt: "Phone number", type: "tel", required: true },
  {
    name: "projectType",
    no: "05",
    prompt: "Project type",
    type: "choice",
    required: true,
    other: "Something else",
    options: [
      { value: "New build" },
      { value: "Addition" },
      { value: "Renovation" },
      { value: "Garden suite (ADU)" },
      { value: "Commercial / retail" },
      { value: "Not sure yet" },
    ],
  },
  {
    name: "stage",
    no: "06",
    prompt: "What stage are you in?",
    type: "choice",
    required: true,
    other: "Something else",
    options: [
      { value: "Just exploring" },
      { value: "Own the property, nothing drawn" },
      { value: "Have concept drawings" },
      { value: "Have permits, need construction" },
      { value: "Need permits only" },
    ],
  },
  {
    name: "budget",
    no: "07",
    prompt: "Approximate budget",
    type: "choice",
    required: true,
    other: "Enter an amount",
    options: [
      { value: "$20k – $50k" },
      { value: "$50k – $100k" },
      { value: "$100k – $250k" },
      { value: "$250k – $500k" },
      { value: "$500k – $1M" },
      { value: "$1M – $3M" },
      { value: "$3M+" },
    ],
  },
  {
    name: "timeline",
    no: "08",
    prompt: "Target timeline",
    type: "choice",
    required: true,
    other: "Something else",
    options: [
      { value: "ASAP" },
      { value: "1–3 months" },
      { value: "3–6 months" },
      { value: "6+ months" },
      { value: "Just researching" },
    ],
  },
  {
    name: "message",
    no: "09",
    prompt: "Tell us more about the project.",
    hint: "Optional",
    type: "textarea",
  },
  {
    name: "referral",
    no: "10",
    prompt: "How did you hear about us?",
    type: "choice",
    required: true,
    other: "Somewhere else",
    options: [
      { value: "Referral", note: "Who referred you?" },
      { value: "Ads" },
      { value: "Web search" },
    ],
  },
  { name: "date", no: "11", prompt: "A preferred date?", hint: "Optional", type: "date" },
  { name: "slot", no: "12", prompt: "Pick a time that works.", hint: "All times ET", type: "slots", required: true },
];

// ponytail: static slots for now — swap for the owner's Google Calendar
// free/busy later. Keep the shape a string[] and this component won't change.
const SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function BookingForm() {
  const [state, action, pending] = useActionState<BookingState, FormData>(
    submitBooking,
    { ok: false },
  );
  const [values, setValues] = useState<Record<string, string>>({});
  // Steps where the user picked "Other" and is typing a free-text answer.
  const [othered, setOthered] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState(0); // highest step index shown
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);

  function validate(step: Step): string | null {
    const v = (values[step.name] ?? "").trim();
    if (step.required && !v) return "This one's required.";
    if (step.name === "email" && v && !EMAIL_RE.test(v))
      return "Please enter a valid email.";
    return null;
  }

  function next(i: number) {
    const err = validate(STEPS[i]);
    if (err) return setError(err);
    setError(null);
    if (i === STEPS.length - 1) {
      formRef.current?.requestSubmit();
      return;
    }
    setRevealed((r) => Math.max(r, i + 1));
    requestAnimationFrame(() => {
      // The page just grew a section; nudge Lenis to re-measure so the new
      // area is reachable and free up/down scrolling works.
      window.dispatchEvent(new Event("resize"));
      sections.current[i + 1]?.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (state.ok) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-clay">Received</p>
          <h2 className="mt-4 text-4xl text-ink md:text-5xl">
            Thanks — we&apos;ll be in touch.
          </h2>
          <p className="mt-4 text-umber/80">
            Your consultation request has been sent, and a confirmation is on its
            way to your inbox. Expect a reply shortly to confirm a time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action}>
      {STEPS.map((step, i) => {
        if (i > revealed) return null;
        const isLast = i === STEPS.length - 1;
        const pickerLike = step.type === "slots" || step.type === "choice";
        return (
          <section
            key={step.name}
            ref={(el) => {
              sections.current[i] = el;
            }}
            style={{ zIndex: i + 1 }}
            className="sticky top-0 flex min-h-screen items-center border-t border-umber/15 bg-cream"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-2xl px-6 py-28 md:px-8"
            >
              <div className="flex items-center gap-3 text-clay">
                <span className="font-display text-sm">{step.no}</span>
                <span className="h-px w-8 bg-clay/40" />
                <span className="text-[0.7rem] uppercase tracking-[0.3em]">
                  Step {i + 1} of {STEPS.length}
                </span>
              </div>

              <label className="mt-6 block text-3xl leading-tight text-ink md:text-5xl">
                {step.prompt}
              </label>
              {step.hint && (
                <p className="mt-2 text-sm text-umber/60">{step.hint}</p>
              )}

              {pickerLike && (
                <input type="hidden" name={step.name} value={values[step.name] ?? ""} />
              )}

              {step.type === "slots" ? (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SLOTS.map((slot) => {
                    const active = values[step.name] === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setValues((v) => ({ ...v, [step.name]: slot }));
                          setError(null);
                        }}
                        className={`cursor-pointer rounded-lg border px-4 py-3 text-sm transition-colors ${
                          active
                            ? "border-terracotta bg-terracotta text-cream"
                            : "border-umber/25 text-umber hover:border-terracotta"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : step.type === "choice" ? (
                <>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {step.options?.map((opt) => {
                      const active =
                        !othered[step.name] && values[step.name] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setValues((v) => ({ ...v, [step.name]: opt.value }));
                            setOthered((o) => ({ ...o, [step.name]: false }));
                            setError(null);
                          }}
                          className={`cursor-pointer rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                            active
                              ? "border-terracotta bg-terracotta text-cream"
                              : "border-umber/25 text-umber hover:border-terracotta"
                          }`}
                        >
                          {opt.value}
                          {opt.note && (
                            <span
                              className={`mt-1 block text-xs ${
                                active ? "text-cream/75" : "text-umber/55"
                              }`}
                            >
                              {opt.note}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {step.other && (
                      <button
                        type="button"
                        onClick={() => {
                          setValues((v) => ({ ...v, [step.name]: "" }));
                          setOthered((o) => ({ ...o, [step.name]: true }));
                          setError(null);
                        }}
                        className={`cursor-pointer rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                          othered[step.name]
                            ? "border-terracotta text-terracotta"
                            : "border-umber/25 text-umber hover:border-terracotta"
                        }`}
                      >
                        {step.other}
                      </button>
                    )}
                  </div>
                  {othered[step.name] && (
                    <input
                      autoFocus
                      value={values[step.name] ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [step.name]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          next(i);
                        }
                      }}
                      className="mt-6 w-full border-b-2 border-umber/25 bg-transparent pb-3 text-xl text-ink outline-none transition-colors focus:border-terracotta"
                    />
                  )}
                </>
              ) : step.type === "textarea" ? (
                <textarea
                  name={step.name}
                  rows={4}
                  autoFocus={i === revealed}
                  value={values[step.name] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [step.name]: e.target.value }))
                  }
                  className="mt-8 w-full resize-none border-b-2 border-umber/25 bg-transparent pb-3 text-xl text-ink outline-none transition-colors focus:border-terracotta"
                />
              ) : (
                <input
                  name={step.name}
                  type={step.type}
                  autoFocus={i === revealed}
                  value={values[step.name] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [step.name]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      next(i);
                    }
                  }}
                  className="mt-8 w-full border-b-2 border-umber/25 bg-transparent pb-3 text-xl text-ink outline-none transition-colors focus:border-terracotta"
                />
              )}

              {i === revealed && error && (
                <p className="mt-3 text-sm text-terracotta">{error}</p>
              )}

              {i === revealed && (
                <button
                  type="button"
                  onClick={() => next(i)}
                  disabled={pending}
                  className="mt-10 inline-flex cursor-pointer items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-clay disabled:opacity-60"
                >
                  {isLast
                    ? pending
                      ? "Sending…"
                      : "Request Consultation"
                    : "Next"}
                  <span aria-hidden>→</span>
                </button>
              )}

              {state.error && i === revealed && (
                <p className="mt-3 text-sm text-terracotta">{state.error}</p>
              )}
            </motion.div>
          </section>
        );
      })}
    </form>
  );
}
