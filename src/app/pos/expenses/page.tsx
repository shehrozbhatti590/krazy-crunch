"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import PosHeader from "@/components/pos/PosHeader";
import { supabase } from "@/lib/supabase";
import { businessDateInputValue, businessDayRangeIso } from "@/config/business-day";
import type { PosOrder } from "@/lib/pos-types";

type ExpenseType = "fixed" | "operational" | "deal";
type Payment = "cash" | "online" | "credit";
type PeriodMode = "day" | "month";
type Expense = {
  id: string;
  created_at: string;
  expense_date: string;
  title: string;
  category: string;
  amount: number;
  expense_type: ExpenseType;
  payment_method: Payment;
  vendor: string | null;
  notes: string | null;
  is_recurring: boolean;
};
type ExpenseForm = Omit<Expense, "id" | "created_at" | "amount"> & { amount: string };

const categories = ["Rent", "Salaries", "Utilities", "Ingredients", "Packaging", "Marketing", "Delivery", "Maintenance", "Supplies", "Other"];
const typeNames: Record<ExpenseType, string> = { fixed: "Fixed", operational: "Daily operations", deal: "Deal / campaign" };
const paymentNames: Record<Payment, string> = { cash: "Cash", online: "Online", credit: "Credit" };

function dateToday() {
  return businessDateInputValue();
}

function emptyForm(): ExpenseForm {
  return { title: "", category: "Ingredients", amount: "", expense_date: dateToday(), expense_type: "operational", payment_method: "cash", vendor: "", notes: "", is_recurring: false };
}

const money = (amount: number) => `Rs. ${Math.round(amount).toLocaleString()}`;
const dateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function ExpensesPage() {
  const [mode, setMode] = useState<PeriodMode>("day");
  const [day, setDay] = useState(dateToday());
  const [month, setMonth] = useState(dateToday().slice(0, 7));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const period = useMemo(() => {
    if (mode === "day") return { from: day, to: day };
    const [year, monthNumber] = month.split("-").map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();
    return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` };
  }, [day, mode, month]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const range = mode === "day"
        ? businessDayRangeIso(period.from)
        : {
            start: new Date(`${period.from}T00:00:00`).toISOString(),
            end: new Date(`${period.to}T23:59:59.999`).toISOString(),
          };
      const [expenseResult, orderResult] = await Promise.all([
        supabase.from("expenses").select("*").gte("expense_date", period.from).lte("expense_date", period.to).order("expense_date", { ascending: false }).order("created_at", { ascending: false }),
        supabase.from("orders").select("*").gte("created_at", range.start).lt("created_at", range.end),
      ]);
      if (expenseResult.error) throw expenseResult.error;
      if (orderResult.error) throw orderResult.error;
      setExpenses((expenseResult.data as Expense[]) ?? []);
      setOrders((orderResult.data as PosOrder[]) ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Financial records could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { void load(); }, [load]);

  const revenue = useMemo(() => orders.filter((order) => order.status === "completed").reduce((sum, order) => sum + Number(order.subtotal), 0), [orders]);
  const total = useMemo(() => expenses.reduce((sum, expense) => sum + Number(expense.amount), 0), [expenses]);
  const creditDue = useMemo(() => expenses.filter((expense) => expense.payment_method === "credit").reduce((sum, expense) => sum + Number(expense.amount), 0), [expenses]);
  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    expenses.forEach((expense) => totals.set(expense.category, (totals.get(expense.category) ?? 0) + Number(expense.amount)));
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [expenses]);
  const visibleExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) =>
      (typeFilter === "all" || expense.expense_type === typeFilter) &&
      (categoryFilter === "all" || expense.category === categoryFilter) &&
      (paymentFilter === "all" || expense.payment_method === paymentFilter) &&
      (!query || [expense.title, expense.vendor ?? "", expense.category, expense.notes ?? ""].some((value) => value.toLowerCase().includes(query)))
    );
  }, [categoryFilter, expenses, paymentFilter, search, typeFilter]);

  const change = <K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  function resetForm() {
    setEditing(null);
    setForm(emptyForm());
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError("Enter an expense name and an amount greater than zero.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    const record = {
      ...form,
      title: form.title.trim(),
      amount,
      vendor: (form.vendor ?? "").trim() || null,
      notes: (form.notes ?? "").trim() || null,
    };
    try {
      const result = editing
        ? await supabase.from("expenses").update(record).eq("id", editing)
        : await supabase.from("expenses").insert(record);
      if (result.error) throw result.error;
      setNotice(editing ? "Expense changes saved." : "Expense recorded successfully.");
      resetForm();
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Expense could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function edit(expense: Expense) {
    setEditing(expense.id);
    setForm({ title: expense.title, category: expense.category, amount: String(expense.amount), expense_date: expense.expense_date, expense_type: expense.expense_type, payment_method: expense.payment_method, vendor: expense.vendor ?? "", notes: expense.notes ?? "", is_recurring: expense.is_recurring });
    setNotice("");
    document.getElementById("expense-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function remove(expense: Expense) {
    if (!window.confirm(`Delete “${expense.title}” (${money(Number(expense.amount))})?`)) return;
    setBusyId(expense.id);
    setError("");
    try {
      const { error: deleteError } = await supabase.from("expenses").delete().eq("id", expense.id);
      if (deleteError) throw deleteError;
      setNotice("Expense deleted.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Expense could not be deleted.");
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const columns = ["Date", "Expense", "Category", "Type", "Payment method", "Vendor", "Amount", "Recurring", "Notes"];
    const rows = visibleExpenses.map((expense) => [expense.expense_date, expense.title, expense.category, typeNames[expense.expense_type], paymentNames[expense.payment_method], expense.vendor ?? "", String(expense.amount), expense.is_recurring ? "Yes" : "No", expense.notes ?? ""]);
    const csv = [columns, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${mode === "day" ? day : month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const inputClass = "mt-1.5 w-full rounded-xl border border-[#f5f4fb]/10 bg-[#0b0a0f] px-3.5 py-3 font-body text-sm text-[#f5f4fb] outline-none transition placeholder:text-[#f5f4fb]/25 focus:border-mustard/60";
  const labelClass = "font-body text-[11px] font-bold uppercase tracking-wide text-[#f5f4fb]/55";

  return <>
    <div className="no-print"><PosHeader todayTotal={revenue} /></div>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-body text-[11px] font-extrabold uppercase tracking-[.2em] text-mustard">Money in, money out</p><h1 className="mt-1 font-display text-4xl tracking-wide text-[#f5f4fb]">Expense Manager</h1><p className="mt-1 font-body text-sm text-[#f5f4fb]/45">Record spending, follow supplier balances and understand where money goes.</p></div>
        <div className="no-print flex gap-2"><button type="button" onClick={() => window.print()} className="rounded-xl border border-[#f5f4fb]/15 px-4 py-2.5 font-body text-xs font-extrabold uppercase tracking-wide text-[#f5f4fb]/75 transition hover:bg-[#f5f4fb]/5">Print</button><button type="button" onClick={exportCsv} disabled={visibleExpenses.length === 0} className="rounded-xl bg-mustard px-4 py-2.5 font-body text-xs font-extrabold uppercase tracking-wide text-[#17110d] transition hover:brightness-95 disabled:opacity-40">Export CSV</button></div>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Sales revenue" value={money(revenue)} note="Completed orders in period" tone="text-leaf" icon="↗" />
        <SummaryCard label="Total expenses" value={money(total)} note={`${expenses.length} recorded expense${expenses.length === 1 ? "" : "s"}`} tone="text-chili" icon="↘" />
        <SummaryCard label="Net cash flow" value={money(revenue - total)} note="Revenue minus recorded expenses" tone={revenue >= total ? "text-mustard" : "text-chili"} icon="=" />
        <SummaryCard label="Unpaid on credit" value={money(creditDue)} note="Expenses marked as credit" tone="text-[#f5f4fb]" icon="◷" />
      </section>

      <section className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-display text-2xl tracking-wide text-[#f5f4fb]">Expense ledger</h2><p className="mt-0.5 font-body text-xs text-[#f5f4fb]/40">{visibleExpenses.length} of {expenses.length} records</p></div>
              <div className="no-print flex items-center gap-2 rounded-xl border border-[#f5f4fb]/10 bg-[#0b0a0f] p-1">
                {(["day", "month"] as PeriodMode[]).map((option) => <button key={option} type="button" onClick={() => setMode(option)} className={`rounded-lg px-3 py-2 font-body text-[11px] font-extrabold uppercase tracking-wide transition ${mode === option ? "bg-mustard text-[#17110d]" : "text-[#f5f4fb]/50 hover:text-[#f5f4fb]"}`}>{option === "day" ? "Daily" : "Monthly"}</button>)}
                <input aria-label={mode === "day" ? "Select date" : "Select month"} className="ml-1 max-w-[150px] bg-transparent px-1 py-2 font-body text-xs text-[#f5f4fb] outline-none" type={mode === "day" ? "date" : "month"} value={mode === "day" ? day : month} onChange={(event) => mode === "day" ? setDay(event.target.value || dateToday()) : setMonth(event.target.value || dateToday().slice(0, 7))} />
              </div>
            </div>

            <div className="no-print mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <input aria-label="Search expenses" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, vendor, notes..." className={inputClass + " mt-0"} />
              <select aria-label="Filter category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={inputClass + " mt-0"}><option value="all">All categories</option>{[...new Set([...categories, ...expenses.map((expense) => expense.category)])].sort().map((category) => <option key={category} value={category}>{category}</option>)}</select>
              <select aria-label="Filter expense type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={inputClass + " mt-0"}><option value="all">All expense types</option>{Object.entries(typeNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select>
              <select aria-label="Filter payment method" value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className={inputClass + " mt-0"}><option value="all">All payment methods</option>{Object.entries(paymentNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select>
            </div>
          </div>

          {error && <p role="alert" className="mt-3 rounded-xl border border-chili/30 bg-chili/10 px-4 py-3 font-body text-sm text-chili">{error}</p>}
          {notice && <p role="status" className="mt-3 rounded-xl border border-leaf/25 bg-leaf/10 px-4 py-3 font-body text-sm text-leaf">{notice}</p>}

          <div className="mt-3 overflow-hidden rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a]">
            {loading ? <div className="p-10 text-center font-body text-sm text-[#f5f4fb]/45">Loading financial records...</div> : visibleExpenses.length === 0 ? <div className="p-10 text-center"><span className="text-3xl" aria-hidden>🧾</span><h3 className="mt-3 font-display text-xl text-[#f5f4fb]">{expenses.length ? "No matching expenses" : "No expenses for this period"}</h3><p className="mx-auto mt-1 max-w-sm font-body text-sm text-[#f5f4fb]/45">{expenses.length ? "Try changing your search or filters." : "Add your first expense with the form to keep your records up to date."}</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left">
              <thead><tr className="border-b border-[#f5f4fb]/10 bg-[#0f0d14]">{["Date / expense", "Category", "Type", "Paid by", "Amount", ""].map((heading) => <th key={heading} className="px-4 py-3 font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/40">{heading}</th>)}</tr></thead>
              <tbody>{visibleExpenses.map((expense) => <tr key={expense.id} className="border-b border-[#f5f4fb]/5 last:border-0 hover:bg-[#f5f4fb]/[.025]">
                <td className="px-4 py-3.5"><p className="font-body text-sm font-bold text-[#f5f4fb]">{expense.title}{expense.is_recurring && <span className="ml-2 rounded-full bg-mustard/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-mustard">Recurring</span>}</p><p className="mt-1 font-body text-[11px] text-[#f5f4fb]/40">{dateLabel(expense.expense_date)}{expense.vendor ? ` · ${expense.vendor}` : ""}</p>{expense.notes && <p className="mt-1 max-w-xs truncate font-body text-[11px] text-[#f5f4fb]/35">{expense.notes}</p>}</td>
                <td className="px-4 py-3.5 font-body text-xs text-[#f5f4fb]/65">{expense.category}</td>
                <td className="px-4 py-3.5"><span className="rounded-full bg-mustard/10 px-2.5 py-1 font-body text-[10px] font-bold text-mustard">{typeNames[expense.expense_type]}</span></td>
                <td className="px-4 py-3.5"><span className={`font-body text-xs font-semibold ${expense.payment_method === "credit" ? "text-chili" : "text-[#f5f4fb]/65"}`}>{paymentNames[expense.payment_method]}</span></td>
                <td className="px-4 py-3.5 font-display text-lg text-[#f5f4fb]">{money(Number(expense.amount))}</td>
                <td className="no-print px-4 py-3.5 text-right"><button type="button" onClick={() => edit(expense)} className="rounded-lg px-2.5 py-1.5 font-body text-[11px] font-bold text-mustard hover:bg-mustard/10">Edit</button><button type="button" disabled={busyId === expense.id} onClick={() => void remove(expense)} className="rounded-lg px-2.5 py-1.5 font-body text-[11px] font-bold text-chili hover:bg-chili/10 disabled:opacity-40">{busyId === expense.id ? "..." : "Delete"}</button></td>
              </tr>)}</tbody>
            </table></div>}
          </div>
        </div>

        <aside className="no-print space-y-4 xl:sticky xl:top-24">
          <form id="expense-form" onSubmit={save} className="scroll-mt-24 rounded-2xl border border-mustard/20 bg-[#14111a] p-5 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between gap-3"><div><p className="font-body text-[10px] font-extrabold uppercase tracking-[.18em] text-mustard">{editing ? "Update record" : "New record"}</p><h2 className="mt-1 font-display text-2xl text-[#f5f4fb]">{editing ? "Edit expense" : "Add an expense"}</h2></div>{editing && <button type="button" onClick={resetForm} className="rounded-lg px-2 py-1 font-body text-xs font-bold text-[#f5f4fb]/50 hover:bg-[#f5f4fb]/5 hover:text-[#f5f4fb]">Cancel</button>}</div>
            <div className="mt-5 space-y-3.5">
              <label className="block"><span className={labelClass}>Expense name *</span><input required maxLength={120} autoComplete="off" className={inputClass} value={form.title} onChange={(event) => change("title", event.target.value)} placeholder="e.g. Chicken supplier invoice" /></label>
              <div className="grid grid-cols-2 gap-3"><label className="block"><span className={labelClass}>Amount (Rs.) *</span><input required type="number" min="0.01" step="0.01" inputMode="decimal" className={inputClass} value={form.amount} onChange={(event) => change("amount", event.target.value)} placeholder="0.00" /></label><label className="block"><span className={labelClass}>Date *</span><input required type="date" className={inputClass} value={form.expense_date} onChange={(event) => change("expense_date", event.target.value)} /></label></div>
              <div className="grid grid-cols-2 gap-3"><label className="block"><span className={labelClass}>Category</span><input list="expense-category-options" maxLength={60} className={inputClass} value={form.category} onChange={(event) => change("category", event.target.value)} /><datalist id="expense-category-options">{categories.map((category) => <option key={category} value={category} />)}</datalist></label><label className="block"><span className={labelClass}>Expense type</span><select className={inputClass} value={form.expense_type} onChange={(event) => change("expense_type", event.target.value as ExpenseType)}>{Object.entries(typeNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label></div>
              <div className="grid grid-cols-2 gap-3"><label className="block"><span className={labelClass}>Payment status</span><select className={inputClass} value={form.payment_method} onChange={(event) => change("payment_method", event.target.value as Payment)}>{Object.entries(paymentNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label><label className="block"><span className={labelClass}>Vendor / payee</span><input maxLength={120} className={inputClass} value={form.vendor ?? ""} onChange={(event) => change("vendor", event.target.value)} placeholder="Optional" /></label></div>
              <label className="block"><span className={labelClass}>Notes / reference</span><textarea maxLength={500} rows={2} className={inputClass + " resize-y"} value={form.notes ?? ""} onChange={(event) => change("notes", event.target.value)} placeholder="Invoice number or useful details" /></label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#f5f4fb]/8 bg-[#0b0a0f] p-3"><input type="checkbox" checked={form.is_recurring} onChange={(event) => change("is_recurring", event.target.checked)} className="h-4 w-4 accent-[#eab308]" /><span><span className="block font-body text-xs font-bold text-[#f5f4fb]">Recurring expense</span><span className="mt-0.5 block font-body text-[10px] text-[#f5f4fb]/40">Mark rent, salaries, subscriptions, etc.</span></span></label>
              <button type="submit" disabled={saving} className="w-full rounded-xl bg-mustard py-3 font-body text-xs font-extrabold uppercase tracking-wider text-[#17110d] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60">{saving ? "Saving..." : editing ? "Save changes" : "Record expense"}</button>
              {error && <p role="alert" className="rounded-lg bg-chili/10 px-3 py-2 font-body text-xs text-chili">{error}</p>}
            </div>
          </form>

          <div className="rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a] p-5"><div className="flex items-center justify-between"><h2 className="font-display text-xl text-[#f5f4fb]">Spend by category</h2><span className="font-body text-[10px] font-bold uppercase text-[#f5f4fb]/35">Top 5</span></div>{categoryTotals.length ? <div className="mt-4 space-y-3">{categoryTotals.map(([category, amount]) => <div key={category}><div className="mb-1 flex justify-between gap-3 font-body text-xs"><span className="truncate text-[#f5f4fb]/65">{category}</span><span className="font-bold text-[#f5f4fb]">{money(amount)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#f5f4fb]/8"><div className="h-full rounded-full bg-mustard" style={{ width: `${total ? Math.max(3, amount / total * 100) : 0}%` }} /></div></div>)}</div> : <p className="mt-3 font-body text-xs text-[#f5f4fb]/40">Your category breakdown will appear here.</p>}</div>
        </aside>
      </section>
    </main>
  </>;
}

function SummaryCard({ label, value, note, tone, icon }: { label: string; value: string; note: string; tone: string; icon: string }) {
  return <div className="rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a] p-4"><div className="flex items-center justify-between"><p className="font-body text-[10px] font-extrabold uppercase tracking-[.14em] text-[#f5f4fb]/45">{label}</p><span className={`font-display text-xl ${tone}`} aria-hidden>{icon}</span></div><p className={`mt-2 font-display text-2xl sm:text-3xl ${tone}`}>{value}</p><p className="mt-1 font-body text-[11px] text-[#f5f4fb]/40">{note}</p></div>;
}
