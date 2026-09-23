"use client";

import { useEffect, useMemo, useState } from "react";
import PosHeader from "@/components/pos/PosHeader";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import { businessDateInputValue, businessDayRangeIso } from "@/config/business-day";
import type { PosOrder } from "@/lib/pos-types";

type Mode = "day" | "month";

function toDateInputValue(d: Date) {
  return businessDateInputValue(d);
}

function toMonthInputValue(d: Date) {
  return toDateInputValue(d).slice(0, 7);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

function dayRangeIso(dateStr: string) {
  const safe = dateStr && DATE_RE.test(dateStr) ? dateStr : toDateInputValue(new Date());
  return businessDayRangeIso(safe);
}

function monthRangeIso(monthStr: string) {
  const safe = monthStr && MONTH_RE.test(monthStr) ? monthStr : toMonthInputValue(new Date());
  const [y, m] = safe.split("-").map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function ReportsPage() {
  const [mode, setMode] = useState<Mode>("day");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [month, setMonth] = useState(toMonthInputValue(new Date()));
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const { start, end } = mode === "day" ? dayRangeIso(date) : monthRangeIso(month);

    supabase
      .from("orders")
      .select("*")
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setOrders((data as PosOrder[]) ?? []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mode, date, month]);

  const completed = useMemo(() => orders.filter((o) => o.status === "completed"), [orders]);
  const cancelled = useMemo(() => orders.filter((o) => o.status === "cancelled"), [orders]);

  const totalRevenue = completed.reduce((sum, o) => sum + Number(o.subtotal), 0);
  const cashOrders = completed.filter((o) => o.payment_method === "cash");
  const onlineOrders = completed.filter((o) => o.payment_method === "online");
  const cashTotal = cashOrders.reduce((sum, o) => sum + Number(o.subtotal), 0);
  const onlineTotal = onlineOrders.reduce((sum, o) => sum + Number(o.subtotal), 0);
  const avgOrder = completed.length ? totalRevenue / completed.length : 0;

  const typeCounts = { "dine-in": 0, takeaway: 0, delivery: 0 } as Record<string, number>;
  completed.forEach((o) => {
    typeCounts[o.order_type] = (typeCounts[o.order_type] ?? 0) + 1;
  });

  const itemTotals = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    completed.forEach((order) => {
      order.items.forEach((line) => {
        const existing = map.get(line.name);
        if (existing) {
          existing.qty += line.qty;
          existing.revenue += line.qty * line.price;
        } else {
          map.set(line.name, { name: line.name, qty: line.qty, revenue: line.qty * line.price });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  }, [completed]);

  const periodLabel =
    mode === "day"
      ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
        });

  function exportCsv() {
    const header = ["Order #", "Date", "Time", "Items", "Type", "Payment", "Total", "Status"];
    const rows = orders.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString(),
      new Date(o.created_at).toLocaleTimeString(),
      o.items.map((i) => `${i.qty}x ${i.name}`).join("; "),
      o.order_type,
      o.payment_method,
      Number(o.subtotal).toFixed(0),
      o.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krazy-crunch-report-${mode === "day" ? date : month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="no-print">
        <PosHeader todayTotal={totalRevenue} />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl tracking-wide text-[#f5f4fb]">Sales Report</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-[#f5f4fb]/15 bg-[#14111a] p-1">
              <button
                onClick={() => setMode("day")}
                className={`rounded-md px-3 py-1.5 font-body text-xs font-extrabold uppercase transition ${
                  mode === "day" ? "bg-mustard text-[#17110d]" : "text-[#f5f4fb]/55"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setMode("month")}
                className={`rounded-md px-3 py-1.5 font-body text-xs font-extrabold uppercase transition ${
                  mode === "month" ? "bg-mustard text-[#17110d]" : "text-[#f5f4fb]/55"
                }`}
              >
                Month
              </button>
            </div>

            {mode === "day" ? (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value || toDateInputValue(new Date()))}
                className="rounded-lg border border-[#f5f4fb]/15 bg-[#14111a] px-3 py-2 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
              />
            ) : (
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value || toMonthInputValue(new Date()))}
                className="rounded-lg border border-[#f5f4fb]/15 bg-[#14111a] px-3 py-2 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
              />
            )}

            <button
              onClick={() => window.print()}
              disabled={orders.length === 0}
              className="rounded-lg bg-mustard px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide text-[#17110d] transition hover:brightness-95 disabled:opacity-40"
            >
              Print
            </button>
            <button
              onClick={exportCsv}
              disabled={orders.length === 0}
              className="rounded-lg border border-mustard/40 bg-mustard/10 px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide text-mustard transition hover:bg-mustard hover:text-[#141225] disabled:opacity-40"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Print-only heading */}
        <div className="report-print-header hidden print:block">
          <h1 className="text-2xl font-bold">{"Krazy Crunch"}</h1>
          <p className="text-sm text-gray-600">{siteConfig.address}</p>
          <p className="mt-2 text-lg font-bold">
            Sales Report - {periodLabel}
          </p>
        </div>

        {loading ? (
          <p className="mt-8 font-body text-sm text-[#f5f4fb]/40">Loading report...</p>
        ) : (
          <>
            <div className="report-print mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4 print:gap-2 print:border print:border-black">
              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-4 print:rounded-none print:border-0 print:border-r print:border-black print:bg-white print:p-2">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40 print:text-black">
                  Revenue
                </p>
                <p className="mt-1 font-display text-2xl leading-none text-mustard print:text-black">
                  Rs.{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-4 print:rounded-none print:border-0 print:border-r print:border-black print:bg-white print:p-2">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40 print:text-black">
                  Orders
                </p>
                <p className="mt-1 font-display text-2xl leading-none text-[#f5f4fb] print:text-black">
                  {completed.length}
                </p>
              </div>
              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-4 print:rounded-none print:border-0 print:border-r print:border-black print:bg-white print:p-2">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40 print:text-black">
                  Avg Order
                </p>
                <p className="mt-1 font-display text-2xl leading-none text-[#f5f4fb] print:text-black">
                  Rs.{Math.round(avgOrder).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-chili/20 bg-chili/5 p-4 print:rounded-none print:border-0 print:bg-white print:p-2">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-chili/70 print:text-black">
                  Cancelled
                </p>
                <p className="mt-1 font-display text-2xl leading-none text-chili print:text-black">
                  {cancelled.length}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-2">
              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-5 print:rounded-none print:border print:border-black print:bg-white print:p-2">
                <h2 className="font-display text-lg tracking-wide text-[#f5f4fb] print:text-base print:font-bold print:text-black">
                  Payment Split
                </h2>
                <div className="mt-3 flex flex-col gap-2 print:mt-1 print:gap-1">
                  <div className="flex items-center justify-between rounded-lg bg-leaf/10 px-3 py-2 print:rounded-none print:bg-white print:px-0 print:py-0.5">
                    <span className="font-body text-sm font-bold text-leaf print:text-black">
                      {"\u{1F4B5}"} Cash ({cashOrders.length})
                    </span>
                    <span className="font-display text-lg text-leaf print:text-black">
                      Rs.{cashTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-mustard/10 px-3 py-2 print:rounded-none print:bg-white print:px-0 print:py-0.5">
                    <span className="font-body text-sm font-bold text-mustard print:text-black">
                      {"\u{1F4B3}"} Online ({onlineOrders.length})
                    </span>
                    <span className="font-display text-lg text-mustard print:text-black">
                      Rs.{onlineTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-5 print:rounded-none print:border print:border-black print:bg-white print:p-2">
                <h2 className="font-display text-lg tracking-wide text-[#f5f4fb] print:text-base print:font-bold print:text-black">
                  Order Types
                </h2>
                <div className="mt-3 flex flex-col gap-2 print:mt-1 print:gap-1">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-lg bg-[#f5f4fb]/5 px-3 py-2 print:rounded-none print:bg-white print:px-0 print:py-0.5"
                    >
                      <span className="font-body text-sm font-bold capitalize text-[#f5f4fb]/75 print:text-black">
                        {type}
                      </span>
                      <span className="font-display text-lg text-[#f5f4fb] print:text-black">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 print:mt-4">
              <h2 className="font-display text-lg tracking-wide text-[#f5f4fb] print:text-base print:font-bold print:text-black">
                Top Selling Items
              </h2>
              {itemTotals.length === 0 ? (
                <p className="mt-3 font-body text-sm text-[#f5f4fb]/40">No sales this period.</p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-xl border border-[#f5f4fb]/10 print:rounded-none print:border print:border-black">
                  <table className="w-full min-w-[420px] border-collapse text-left print:min-w-0 print:text-xs">
                    <thead>
                      <tr className="border-b border-[#f5f4fb]/10 bg-[#14111a] print:border-black print:bg-white">
                        <th className="px-4 py-3 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45 print:px-2 print:py-1 print:text-black">
                          Item
                        </th>
                        <th className="px-4 py-3 text-right font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45 print:px-2 print:py-1 print:text-black">
                          Qty Sold
                        </th>
                        <th className="px-4 py-3 text-right font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45 print:px-2 print:py-1 print:text-black">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemTotals.map((item) => (
                        <tr
                          key={item.name}
                          className="border-b border-[#f5f4fb]/5 last:border-b-0 print:border-gray-300"
                        >
                          <td className="px-4 py-3 font-body text-sm text-[#f5f4fb]/80 print:px-2 print:py-1 print:text-black">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right font-body text-sm font-bold text-[#f5f4fb] print:px-2 print:py-1 print:text-black">
                            {item.qty}
                          </td>
                          <td className="px-4 py-3 text-right font-display text-base text-mustard print:px-2 print:py-1 print:text-black">
                            Rs.{item.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 print:mt-4">
              <h2 className="font-display text-lg tracking-wide text-[#f5f4fb] print:text-base print:font-bold print:text-black">
                All Orders ({orders.length})
              </h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-[#f5f4fb]/10 print:rounded-none print:border print:border-black">
                <table className="w-full min-w-[640px] border-collapse text-left print:min-w-0 print:text-[10px]">
                  <thead>
                    <tr className="border-b border-[#f5f4fb]/10 bg-[#14111a] print:border-black print:bg-white">
                      <th className="px-3 py-2 font-body text-[10px] font-extrabold uppercase text-[#f5f4fb]/45 print:px-1.5 print:py-1 print:text-black">
                        #
                      </th>
                      <th className="px-3 py-2 font-body text-[10px] font-extrabold uppercase text-[#f5f4fb]/45 print:px-1.5 print:py-1 print:text-black">
                        Date
                      </th>
                      <th className="px-3 py-2 font-body text-[10px] font-extrabold uppercase text-[#f5f4fb]/45 print:px-1.5 print:py-1 print:text-black">
                        Items
                      </th>
                      <th className="px-3 py-2 font-body text-[10px] font-extrabold uppercase text-[#f5f4fb]/45 print:px-1.5 print:py-1 print:text-black">
                        Payment
                      </th>
                      <th className="px-3 py-2 text-right font-body text-[10px] font-extrabold uppercase text-[#f5f4fb]/45 print:px-1.5 print:py-1 print:text-black">
                        Total
                      </th>
                      <th className="px-3 py-2 text-right font-body text-[10px] font-extrabold uppercase text-[#f5f4fb]/45 print:px-1.5 print:py-1 print:text-black">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o.id}
                        className={`border-b border-[#f5f4fb]/5 last:border-b-0 print:border-gray-300 ${
                          o.status === "cancelled" ? "opacity-40" : ""
                        }`}
                      >
                        <td className="px-3 py-2 font-body text-xs font-bold text-[#f5f4fb] print:px-1.5 print:py-1 print:text-black">
                          {o.order_number}
                        </td>
                        <td className="px-3 py-2 font-body text-xs text-[#f5f4fb]/70 print:px-1.5 print:py-1 print:text-black">
                          {new Date(o.created_at).toLocaleDateString()}{" "}
                          {new Date(o.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-2 font-body text-xs text-[#f5f4fb]/70 print:px-1.5 print:py-1 print:text-black">
                          {o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                        </td>
                        <td className="px-3 py-2 font-body text-xs text-[#f5f4fb]/60 print:px-1.5 print:py-1 print:text-black">
                          {o.payment_method}
                        </td>
                        <td className="px-3 py-2 text-right font-body text-xs font-bold text-mustard print:px-1.5 print:py-1 print:text-black">
                          Rs.{Number(o.subtotal).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right font-body text-[10px] font-bold uppercase text-[#f5f4fb]/45 print:px-1.5 print:py-1 print:text-black">
                          {o.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
