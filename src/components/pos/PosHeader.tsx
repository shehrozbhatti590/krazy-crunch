"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutPos } from "@/app/pos/actions";

export default function PosHeader({ todayTotal }: { todayTotal: number }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[#f5f4fb]/10 bg-[#0e0c12]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            {"\u{1F525}"}
          </span>
          <span className="font-display text-xl tracking-wide text-[#f5f4fb]">
            KRAZY<span className="text-mustard">CRUNCH</span>
            <span className="ml-2 rounded-full bg-mustard/15 px-2 py-0.5 align-middle font-body text-[10px] font-extrabold uppercase tracking-wider text-mustard">
              POS
            </span>
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/pos"
            className={`rounded-full px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide transition ${
              pathname === "/pos"
                ? "bg-mustard text-[#17110d]"
                : "text-[#f5f4fb]/65 hover:bg-[#f5f4fb]/10"
            }`}
          >
            New Order
          </Link>
          <Link
            href="/pos/reports"
            className={`rounded-full px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide transition ${
              pathname === "/pos/reports"
                ? "bg-mustard text-[#17110d]"
                : "text-[#f5f4fb]/65 hover:bg-[#f5f4fb]/10"
            }`}
          >
            Reports
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-leaf/30 bg-leaf/10 px-4 py-2 text-right">
            <p className="font-body text-[9px] font-bold uppercase tracking-wider text-leaf/80">
              Today
            </p>
            <p className="font-display text-lg leading-none text-leaf">
              Rs.{todayTotal.toLocaleString()}
            </p>
          </div>
          <form action={logoutPos}>
            <button
              type="submit"
              className="rounded-full border border-[#f5f4fb]/15 bg-[#f5f4fb]/8 px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide text-[#f5f4fb]/70 transition hover:border-chili/50 hover:text-chili"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
