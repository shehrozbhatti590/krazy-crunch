"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import PosHeader from "@/components/pos/PosHeader";
import { supabase } from "@/lib/supabase";
import type { PosOrder } from "@/lib/pos-types";

type ExpenseType = "fixed" | "operational" | "deal";
type Payment = "cash" | "online" | "credit";
type Expense = { id: string; created_at: string; expense_date: string; title: string; category: string; amount: number; expense_type: ExpenseType; payment_method: Payment; vendor: string | null; notes: string | null; is_recurring: boolean };
type Form = { title: string; category: string; amount: string; expense_date: string; expense_type: ExpenseType; payment_method: Payment; vendor: string; notes: string; is_recurring: boolean };
const categories = ["Rent", "Salaries", "Utilities", "Ingredients", "Packaging", "Marketing", "Delivery", "Maintenance", "Supplies", "Other"];
// The shop's business day ends at 3 AM, so late-night expenses stay with
// the shift that started the previous afternoon.
const dateToday = () => {
  const businessDate = new Date();
  if (businessDate.getHours() < 3) businessDate.setDate(businessDate.getDate() - 1);
  const offset = businessDate.getTimezoneOffset();
  return new Date(businessDate.getTime() - offset * 60000).toISOString().slice(0, 10);
};
const empty = (): Form => ({ title: "", category: "Ingredients", amount: "", expense_date: dateToday(), expense_type: "operational", payment_method: "cash", vendor: "", notes: "", is_recurring: false });
const money = (n: number) => `Rs.${Math.round(n).toLocaleString()}`;
const names: Record<ExpenseType, string> = { fixed: "Fixed", operational: "Operational", deal: "Deal / Campaign" };

export default function ExpensesPage() {
  const [mode, setMode] = useState<"day" | "month">("day");
  const [day, setDay] = useState(dateToday());
  const [month, setMonth] = useState(dateToday().slice(0, 7));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ExpenseType>("all");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const value = mode === "day" ? day : month;
  const period = useMemo(() => {
    if (mode === "day") return { from: day, to: day };
    const [year, m] = month.split("-").map(Number);
    return { from: `${month}-01`, to: new Date(year, m, 0).toISOString().slice(0, 10) };
  }, [day, mode, month]);
  const load = useCallback(async () => {
    setLoading(true);
    const start = new Date(`${period.from}T00:00:00`).toISOString();
    const end = new Date(`${period.to}T23:59:59.999`).toISOString();
    const [expenseRes, orderRes] = await Promise.all([
      supabase.from("expenses").select("*").gte("expense_date", period.from).lte("expense_date", period.to).order("expense_date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("orders").select("*").gte("created_at", start).lte("created_at", end),
    ]);
    setExpenses((expenseRes.data as Expense[]) ?? []); setOrders((orderRes.data as PosOrder[]) ?? []); setLoading(false);
  }, [period]);
  useEffect(() => { void load(); }, [load]);
  const revenue = useMemo(() => orders.filter((x) => x.status === "completed").reduce((s, x) => s + Number(x.subtotal), 0), [orders]);
  const total = useMemo(() => expenses.reduce((s, x) => s + Number(x.amount), 0), [expenses]);
  const types = useMemo(() => ({ fixed: expenses.filter(x => x.expense_type === "fixed").reduce((s,x) => s + Number(x.amount), 0), operational: expenses.filter(x => x.expense_type === "operational").reduce((s,x) => s + Number(x.amount), 0), deal: expenses.filter(x => x.expense_type === "deal").reduce((s,x) => s + Number(x.amount), 0) }), [expenses]);
  const list = filter === "all" ? expenses : expenses.filter(x => x.expense_type === filter);
  const change = <K extends keyof Form>(key: K, value: Form[K]) => setForm(old => ({ ...old, [key]: value }));
  async function save(e: FormEvent) {
    e.preventDefault(); const amount = Number(form.amount);
    if (!form.title.trim() || amount <= 0) { setNotice("Expense name aur valid amount enter karein."); return; }
    const record = { ...form, title: form.title.trim(), amount, vendor: form.vendor.trim() || null, notes: form.notes.trim() || null };
    const { error } = editing ? await supabase.from("expenses").update(record).eq("id", editing) : await supabase.from("expenses").insert(record);
    if (error) { setNotice(`Save nahi ho saka: ${error.message}`); return; }
    setNotice(editing ? "Expense update ho gaya." : "Expense record ho gaya."); setForm(empty()); setEditing(null); void load();
  }
  function edit(x: Expense) { setEditing(x.id); setForm({ title:x.title, category:x.category, amount:String(x.amount), expense_date:x.expense_date, expense_type:x.expense_type, payment_method:x.payment_method, vendor:x.vendor ?? "", notes:x.notes ?? "", is_recurring:x.is_recurring }); window.scrollTo({top:0, behavior:"smooth"}); }
  async function remove(x: Expense) { if (!confirm(`Delete “${x.title}”?`)) return; const { error } = await supabase.from("expenses").delete().eq("id", x.id); setNotice(error ? error.message : "Expense delete ho gaya."); if (!error) void load(); }
  function csv() { const rows = [["Date","Expense","Category","Type","Payment","Vendor","Amount","Recurring","Notes"], ...expenses.map(x => [x.expense_date,x.title,x.category,names[x.expense_type],x.payment_method,x.vendor ?? "",String(x.amount),x.is_recurring ? "Yes" : "No",x.notes ?? ""])]; const text = rows.map(r => r.map(c => `"${c.replaceAll('"','""')}"`).join(",")).join("\n"); const url = URL.createObjectURL(new Blob([text],{type:"text/csv"})); const a=document.createElement("a"); a.href=url; a.download=`expenses-${value}.csv`; a.click(); URL.revokeObjectURL(url); }
  return <><div className="no-print"><PosHeader todayTotal={revenue}/></div><main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    <div className="no-print flex flex-wrap items-center justify-between gap-3"><div><p className="font-body text-xs font-extrabold uppercase tracking-[.18em] text-mustard">Financial control</p><h1 className="font-display text-3xl text-[#f5f4fb]">Expense Manager</h1></div><div className="flex gap-2"><button onClick={() => print()} className="button-muted">Print report</button><button onClick={csv} className="button-main">Export CSV</button></div></div>
    <section className="no-print mt-6 grid gap-5 lg:grid-cols-[1fr_340px]"><form onSubmit={save} className="rounded-2xl border border-[#f5f4fb]/10 bg-[#14111a] p-5"><div className="flex justify-between"><h2 className="font-display text-xl text-[#f5f4fb]">{editing ? "Edit expense" : "Record an expense"}</h2>{editing && <button type="button" onClick={() => {setEditing(null);setForm(empty());}} className="font-body text-xs font-bold text-mustard">Cancel</button>}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Input label="Expense name *" value={form.title} onChange={v=>change("title",v)} placeholder="e.g. Chicken supplier invoice" wide/><Input label="Amount (Rs.) *" type="number" value={form.amount} onChange={v=>change("amount",v)} placeholder="0"/><Input label="Expense date *" type="date" value={form.expense_date} onChange={v=>change("expense_date",v)}/><Select label="Category" value={form.category} onChange={v=>change("category",v)} options={categories}/><Select label="Expense type" value={form.expense_type} onChange={v=>change("expense_type",v as ExpenseType)} options={["operational","fixed","deal"]}/><Select label="Paid by" value={form.payment_method} onChange={v=>change("payment_method",v as Payment)} options={["cash","online","credit"]}/><Input label="Vendor / payee" value={form.vendor} onChange={v=>change("vendor",v)} placeholder="Optional"/><Input label="Notes" value={form.notes} onChange={v=>change("notes",v)} placeholder="Invoice number or detail" wide/><label className="flex items-center gap-2 font-body text-xs font-bold text-[#f5f4fb]/70"><input type="checkbox" checked={form.is_recurring} onChange={e=>change("is_recurring",e.target.checked)} className="accent-[#e6be2f]"/>Recurring fixed expense</label><button className="button-main">{editing ? "Update expense" : "Save expense"}</button></div>{notice && <p className="mt-3 font-body text-xs font-bold text-mustard">{notice}</p>}</form><aside className="rounded-2xl border border-mustard/20 bg-mustard/5 p-5"><h2 className="font-display text-xl text-mustard">Expense types</h2><p className="mt-4 font-body text-sm leading-6 text-[#f5f4fb]/65"><b className="text-[#f5f4fb]">Operational:</b> daily running costs, ingredients and utilities.<br/><br/><b className="text-[#f5f4fb]">Fixed:</b> rent, salaries and recurring bills.<br/><br/><b className="text-[#f5f4fb]">Deal / Campaign:</b> promotion or deal-specific spending.</p></aside></section>
    <section className="mt-8"><div className="no-print flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl text-[#f5f4fb]">Expense report</h2><div className="flex gap-2"><div className="flex rounded-lg border border-[#f5f4fb]/15 p-1"><button onClick={()=>setMode("day")} className={mode==="day" ? "period-on" : "period-off"}>Day</button><button onClick={()=>setMode("month")} className={mode==="month" ? "period-on" : "period-off"}>Month</button></div><input className="field !w-auto" type={mode === "day" ? "date" : "month"} value={value} onChange={e=>mode === "day" ? setDay(e.target.value) : setMonth(e.target.value)}/></div></div><div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric label="Sales revenue" value={money(revenue)} tone="text-leaf"/><Metric label="Total expenses" value={money(total)} tone="text-chili"/><Metric label="Net cash flow" value={money(revenue-total)} tone={revenue-total >= 0 ? "text-mustard" : "text-chili"}/><Metric label="Expense ratio" value={revenue ? `${(total/revenue*100).toFixed(1)}%` : "—"} tone="text-[#f5f4fb]"/></div><div className="mt-3 grid gap-3 md:grid-cols-3">{(["fixed","operational","deal"] as ExpenseType[]).map(t=><Metric key={t} label={names[t]} value={money(types[t])} tone="text-[#f5f4fb]"/>)}</div></section>
    <section className="mt-8"><div className="no-print flex justify-between"><h2 className="font-display text-xl text-[#f5f4fb]">Expense ledger ({list.length})</h2><select className="field !w-auto !py-2" value={filter} onChange={e=>setFilter(e.target.value as "all"|ExpenseType)}><option value="all">All types</option><option value="operational">Operational</option><option value="fixed">Fixed</option><option value="deal">Deal / campaign</option></select></div><div className="mt-3 overflow-x-auto rounded-xl border border-[#f5f4fb]/10">{loading ? <p className="p-6 font-body text-sm text-[#f5f4fb]/45">Loading financial records...</p> : <table className="w-full min-w-[800px] text-left"><thead><tr className="border-b border-[#f5f4fb]/10 bg-[#14111a]">{["Date","Expense","Category","Type","Payment","Amount","Actions"].map(x=><th key={x} className="px-4 py-3 font-body text-[10px] font-extrabold uppercase text-[#f5f4fb]/45">{x}</th>)}</tr></thead><tbody>{list.length ? list.map(x=><tr key={x.id} className="border-b border-[#f5f4fb]/5"><td className="cell">{new Date(`${x.expense_date}T00:00:00`).toLocaleDateString()}</td><td className="cell"><b>{x.title}</b>{x.vendor && <small className="block opacity-50">{x.vendor}</small>}</td><td className="cell">{x.category}</td><td className="cell"><span className="rounded-full bg-mustard/10 px-2 py-1 text-[10px] font-bold uppercase text-mustard">{names[x.expense_type]}</span>{x.is_recurring && " ↻"}</td><td className="cell capitalize">{x.payment_method}</td><td className="cell font-display text-base text-chili">{money(Number(x.amount))}</td><td className="cell"><button onClick={()=>edit(x)} className="mr-3 font-bold text-mustard">Edit</button><button onClick={()=>void remove(x)} className="font-bold text-chili">Delete</button></td></tr>) : <tr><td colSpan={7} className="p-8 text-center font-body text-sm text-[#f5f4fb]/45">No expenses recorded for this period.</td></tr>}</tbody></table>}</div></section>
  </main></>;
}
function Input({label,value,onChange,placeholder,type="text",wide=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;wide?:boolean}){return <label className={wide?"sm:col-span-2":""}><span className="label">{label}</span><input required={label.includes("*")} min={type==="number"?"1":undefined} step={type==="number"?"0.01":undefined} className="field" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){return <label><span className="label">{label}</span><select className="field" value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x} value={x}>{x === "operational" ? "Operational / daily" : x === "deal" ? "Deal / campaign" : x}</option>)}</select></label>}
function Metric({label,value,tone}:{label:string;value:string;tone:string}){return <div className="rounded-xl border border-[#f5f4fb]/10 bg-[#14111a] p-4"><p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-[#f5f4fb]/45">{label}</p><p className={`mt-1 font-display text-2xl ${tone}`}>{value}</p></div>}
