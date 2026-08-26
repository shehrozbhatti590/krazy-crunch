"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import type { PosOrder } from "@/lib/pos-types";

const paymentLabel: Record<string, string> = {
  cash: "Cash",
  online: "Online",
};

const typeLabel: Record<string, string> = {
  "dine-in": "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
};

export default function ReceiptPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [order, setOrder] = useState<PosOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setOrder(data as PosOrder | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0a0f]">
        <p className="font-body text-sm text-[#f5f4fb]/50">Loading receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0a0f]">
        <p className="font-body text-sm text-[#f5f4fb]/50">Receipt not found.</p>
      </div>
    );
  }

  const createdAt = new Date(order.created_at);

  return (
    <div className="receipt-page min-h-screen bg-[#0b0a0f] py-8 print:py-0" style={{ colorScheme: "light" }}>
      <div className="no-print mx-auto mb-5 flex max-w-[340px] justify-center gap-2 px-4">
        <button
          onClick={() => window.print()}
          className="flex-1 rounded-lg bg-mustard py-2.5 font-body text-xs font-extrabold uppercase tracking-wide text-[#17110d] transition hover:brightness-95"
        >
          Print Receipt
        </button>
        <button
          onClick={() => window.close()}
          className="rounded-lg border border-[#f5f4fb]/15 px-4 py-2.5 font-body text-xs font-extrabold uppercase tracking-wide text-[#f5f4fb]/60"
        >
          Close
        </button>
      </div>

      <div
        className="receipt-slip mx-auto w-[300px] p-5 font-mono text-[13px] leading-5 shadow-2xl print:w-full print:shadow-none"
        style={{ backgroundColor: "#ffffff", color: "#141414" }}
      >
        <div className="text-center">
          <p className="text-lg font-bold uppercase tracking-wide">Krazy Crunch</p>
          <p className="mt-0.5">{siteConfig.address}</p>
          <p>{siteConfig.phoneDisplay}</p>
        </div>

        <div className="my-3 border-t border-dashed" style={{ borderColor: "#141414" }} />

        <div className="flex justify-between">
          <span>Order #</span>
          <span className="font-bold">{order.order_number}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span>{createdAt.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Time</span>
          <span>{createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="flex justify-between">
          <span>Type</span>
          <span>{typeLabel[order.order_type] ?? order.order_type}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment</span>
          <span>{paymentLabel[order.payment_method] ?? order.payment_method}</span>
        </div>
        {order.staff_name && (
          <div className="flex justify-between">
            <span>Served by</span>
            <span>{order.staff_name}</span>
          </div>
        )}

        <div className="my-3 border-t border-dashed" style={{ borderColor: "#141414" }} />

        <div className="flex justify-between font-bold">
          <span>Item</span>
          <span>Amount</span>
        </div>
        <div className="my-1.5 border-t border-dashed" style={{ borderColor: "#141414" }} />

        {order.items.map((line, i) => (
          <div key={`${line.id}-${i}`} className="mb-1.5 flex justify-between gap-2">
            <span className="flex-1">
              {line.qty} x {line.name}
            </span>
            <span className="shrink-0">Rs.{(line.qty * line.price).toLocaleString()}</span>
          </div>
        ))}

        <div className="my-3 border-t border-dashed" style={{ borderColor: "#141414" }} />

        <div className="flex justify-between text-base font-bold">
          <span>TOTAL</span>
          <span>Rs.{Number(order.subtotal).toLocaleString()}</span>
        </div>

        {order.notes && (
          <>
            <div className="my-3 border-t border-dashed" style={{ borderColor: "#141414" }} />
            <p className="italic">Note: {order.notes}</p>
          </>
        )}

        {order.status === "cancelled" && (
          <p className="mt-3 text-center font-bold uppercase" style={{ color: "#dc2626" }}>
            ** Cancelled **
          </p>
        )}

        <div className="my-3 border-t border-dashed" style={{ borderColor: "#141414" }} />
        <p className="text-center">Thank you for ordering!</p>
        <p className="text-center text-[11px]">
          {siteConfig.whatsappNumber ? `WhatsApp: ${siteConfig.phoneDisplay}` : ""}
        </p>
      </div>
    </div>
  );
}
