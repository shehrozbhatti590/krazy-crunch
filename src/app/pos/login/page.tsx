"use client";

import { useActionState } from "react";
import { verifyPin, type LoginState } from "./actions";

const initialState: LoginState = { error: "" };

export default function PosLoginPage() {
  const [state, formAction, pending] = useActionState(verifyPin, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0a0f] px-5">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a] p-8 shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col items-center text-center">
          <span className="flame-icon text-3xl" aria-hidden>
            {"\u{1F525}"}
          </span>
          <h1 className="mt-3 font-display text-3xl tracking-wide text-[#f5f4fb]">
            KRAZY<span className="text-mustard">CRUNCH</span>
          </h1>
          <p className="mt-1 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#f5f4fb]/45">
            POS Access
          </p>
        </div>

        <input
          type="password"
          name="pin"
          inputMode="numeric"
          autoFocus
          placeholder="Enter PIN"
          className="mt-8 w-full rounded-xl border border-[#f5f4fb]/15 bg-[#0b0a0f] px-4 py-4 text-center font-display text-2xl tracking-[0.3em] text-[#f5f4fb] outline-none transition focus:border-mustard"
        />

        {state?.error && (
          <p className="mt-3 text-center font-body text-sm font-semibold text-chili">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-xl bg-mustard py-3.5 font-body text-sm font-extrabold uppercase tracking-wider text-[#17110d] transition hover:brightness-95 active:scale-95 disabled:opacity-60"
        >
          {pending ? "Checking..." : "Unlock POS"}
        </button>
      </form>
    </main>
  );
}
