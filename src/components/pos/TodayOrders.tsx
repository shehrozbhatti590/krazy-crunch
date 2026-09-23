"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { businessDateInputValue, businessDayRangeIso } from "@/config/business-day";
import type { PosOrder } from "@/lib/pos-types";

const paymentBadge: Record<string, string> = {
  cash: "\u{1F4B5} Cash",
  online: "\u{1F4B3} Online",
};

const typeBadge: Record<string, string> = {
  "dine-in": "\u{1F37D}\uFE0F Dine-in",
  takeaway: "\u{1F6CD}\uFE0F Takeaway",
  delivery: "\u{1F6F5} Delivery",
};

export default function TodayOrders({
  refreshTick,
  onTotalChange,
}: {
  refreshTick: number;
  onTotalChange: (total: number) => void;
}) {
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const { start, end } = businessDayRangeIso(businessDateInputValue());
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as PosOrder[]);
      const total = (data as PosOrder[])
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + Number(o.subtotal), 0);
      onTotalChange(total);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTick]);

  useEffect(() => {
    const channel = supabase
      .channel("orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  async function cancelOrder(order: PosOrder) {
    if (
      !confirm(
        `Cancel order #${order.order_number} (Rs.${Number(order.subtotal).toLocaleString()})? This cannot be undone.`
      )
    )
      return;
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    fetchOrders();
  }

  function printReceipt(id: string) {
    window.open(`/pos/receipt/${id}`, "_blank", "width=380,height=700");
  }

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-[#f5f4fb]">Today&apos;s Orders</h2>

      {loading ? (
        <p className="mt-4 font-body text-sm text-[#f5f4fb]/40">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 font-body text-sm text-[#f5f4fb]/40">No orders yet today.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#f5f4fb]/10">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#f5f4fb]/10 bg-[#14111a]">
                <th className="px-4 py-3 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                  #
                </th>
                <th className="px-4 py-3 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                  Time
                </th>
                <th className="px-4 py-3 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                  Items
                </th>
                <th className="px-4 py-3 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                  Type
                </th>
                <th className="px-4 py-3 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                  Payment
                </th>
                <th className="px-4 py-3 text-right font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                  Total
                </th>
                <th className="px-4 py-3 text-right font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-b border-[#f5f4fb]/5 last:border-b-0 ${
                    order.status === "cancelled" ? "opacity-40" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-body text-sm font-bold text-[#f5f4fb]">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-[#f5f4fb]/70">
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-[#f5f4fb]/70">
                    {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-[#f5f4fb]/60">
                    {typeBadge[order.order_type] ?? order.order_type}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-[#f5f4fb]/60">
                    {paymentBadge[order.payment_method] ?? order.payment_method}
                  </td>
                  <td className="px-4 py-3 text-right font-display text-lg leading-none text-mustard">
                    Rs.{Number(order.subtotal).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => printReceipt(order.id)}
                        className="rounded-full border border-mustard/30 px-3 py-1 font-body text-[10px] font-bold uppercase text-mustard/90 transition hover:bg-mustard/10"
                      >
                        Print
                      </button>
                      {order.status === "completed" ? (
                        <button
                          onClick={() => cancelOrder(order)}
                          className="rounded-full border border-chili/30 px-3 py-1 font-body text-[10px] font-bold uppercase text-chili/80 transition hover:bg-chili/10"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="rounded-full px-3 py-1 font-body text-[10px] font-bold uppercase text-[#f5f4fb]/35">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
