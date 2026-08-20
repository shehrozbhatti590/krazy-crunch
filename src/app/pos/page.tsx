"use client";

import { useCallback, useState } from "react";
import PosHeader from "@/components/pos/PosHeader";
import OrderBuilder from "@/components/pos/OrderBuilder";
import TodayOrders from "@/components/pos/TodayOrders";

export default function PosPage() {
  const [todayTotal, setTodayTotal] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);

  const bumpRefresh = useCallback(() => setRefreshTick((t) => t + 1), []);

  return (
    <>
      <PosHeader todayTotal={todayTotal} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <OrderBuilder onOrderCreated={bumpRefresh} />
        <div className="mt-8">
          <TodayOrders refreshTick={refreshTick} onTotalChange={setTodayTotal} />
        </div>
      </main>
    </>
  );
}
