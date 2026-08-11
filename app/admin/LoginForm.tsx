"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6">
      <form action={action} className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-clay">SHAFE</p>
        <h1 className="mt-3 font-display text-3xl text-ink">Studio Admin</h1>
        <input
          type="password"
          name="password"
          autoFocus
          placeholder="Password"
          className="mt-6 w-full rounded-lg border border-umber/25 bg-white/60 px-4 py-3 text-ink outline-none focus:border-terracotta"
        />
        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-lg bg-terracotta px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-clay disabled:opacity-60"
        >
          {pending ? "…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
