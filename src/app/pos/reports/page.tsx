"use client";

import { useEffect, useMemo, useState } from "react";
import PosHeader from "@/components/pos/PosHeader";
import { supabase } from "@/lib/supabase";
import type { PosOrder } from "@/lib/pos-types";

function toDateInputValue(d: Date) {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function dayRangeIso(dateStr: string) {
  const safeDateStr = dateStr && DATE_RE.test(dateStr) ? dateStr : toDateInputValue(new Date());
  const start = new Date(`${safeDateStr}T00:00:00`);
  const end = new Date(`${safeDateStr}T23:59:59.999`);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function ReportsPage() {
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const { start, end } = dayRangeIso(date);

    supabase
      .from("orders")
      .select("*")
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setOrders((data as PosOrder[]) ?? []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [date]);

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

  function exportCsv() {
    const header = ["Order #", "Time", "Items", "Type", "Payment", "Total", "Status"];
    const rows = orders.map((o) => [
      o.order_number,
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
    a.download = `krazy-crunch-report-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PosHeader todayTotal={totalRevenue} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl tracking-wide text-[#f5f4fb]">Day Report</h1>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value || toDateInputValue(new Date()))}
              className="rounded-lg border border-[#f5f4fb]/15 bg-[#14111a] px-3 py-2 font-body text-sm text-[#f5f4fb] outline-none focus:border-mustard/50"
            />
            <button
              onClick={exportCsv}
              disabled={orders.length === 0}
              className="rounded-lg border border-mustard/40 bg-mustard/10 px-4 py-2 font-body text-xs font-extrabold uppercase tracking-wide text-mustard transition hover:bg-mustard hover:text-[#141225] disabled:opacity-40"
            >
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-8 font-body text-sm text-[#f5f4fb]/40">Loading report...</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-4">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
                  Revenue
                </p>
                <p className="mt-1 font-display text-2xl leading-none text-mustard">
                  Rs.{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-4">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
                  Orders
                </p>
                <p className="mt-1 font-display text-2xl leading-none text-[#f5f4fb]">
                  {completed.length}
                </p>
              </div>
              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-4">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">
                  Avg Order
                </p>
                <p className="mt-1 font-display text-2xl leading-none text-[#f5f4fb]">
                  Rs.{Math.round(avgOrder).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-chili/20 bg-chili/5 p-4">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-chili/70">
                  Cancelled
                </p>
                <p className="mt-1 font-display text-2xl leading-none text-chili">
                  {cancelled.length}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-5">
                <h2 className="font-display text-lg tracking-wide text-[#f5f4fb]">
                  Payment Split
                </h2>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-lg bg-leaf/10 px-3 py-2">
                    <span className="font-body text-sm font-bold text-leaf">
                      {"\u{1F4B5}"} Cash ({cashOrders.length})
                    </span>
                    <span className="font-display text-lg text-leaf">
                      Rs.{cashTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-mustard/10 px-3 py-2">
                    <span className="font-body text-sm font-bold text-mustard">
                      {"\u{1F4B3}"} Online ({onlineOrders.length})
                    </span>
                    <span className="font-display text-lg text-mustard">
                      Rs.{onlineTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-5">
                <h2 className="font-display text-lg tracking-wide text-[#f5f4fb]">Order Types</h2>
                <div className="mt-3 flex flex-col gap-2">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-lg bg-[#f5f4fb]/5 px-3 py-2"
                    >
                      <span className="font-body text-sm font-bold capitalize text-[#f5f4fb]/75">
                        {type}
                      </span>
                      <span className="font-display text-lg text-[#f5f4fb]">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-display text-lg tracking-wide text-[#f5f4fb]">
                Top Selling Items
              </h2>
              {itemTotals.length === 0 ? (
                <p className="mt-3 font-body text-sm text-[#f5f4fb]/40">No sales this day.</p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-xl border border-[#f5f4fb]/10">
                  <table className="w-full min-w-[420px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#f5f4fb]/10 bg-[#14111a]">
                        <th className="px-4 py-3 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                          Item
                        </th>
                        <th className="px-4 py-3 text-right font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                          Qty Sold
                        </th>
                        <th className="px-4 py-3 text-right font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemTotals.map((item) => (
                        <tr key={item.name} className="border-b border-[#f5f4fb]/5 last:border-b-0">
                          <td className="px-4 py-3 font-body text-sm text-[#f5f4fb]/80">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right font-body text-sm font-bold text-[#f5f4fb]">
                            {item.qty}
                          </td>
                          <td className="px-4 py-3 text-right font-display text-base text-mustard">
                            Rs.{item.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}