"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BhavPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ metal: "सोना", purity: "22K", price: "" });
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/bhav").then(r => r.json()).then(data => { if (Array.isArray(data)) setRows(data); });
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.price) return;
    setSaving(true);
    await fetch("/api/bhav", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setForm({ metal: "सोना", purity: "22K", price: "" });
    load();
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
          <h1 className="text-lg font-black text-zinc-800">📈 आज का भाव</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
          <h2 className="font-black text-zinc-800">नया भाव डालो</h2>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.metal} onChange={e => setForm({...form, metal: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base">
              <option>सोना</option>
              <option>चाँदी</option>
            </select>
            <select value={form.purity} onChange={e => setForm({...form, purity: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base">
              <option>24K</option>
              <option>22K</option>
              <option>18K</option>
              <option>916</option>
              <option>999</option>
            </select>
          </div>
          <input placeholder="भाव ₹ (प्रति 10 ग्राम)" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
            className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" />
          <button onClick={submit} disabled={saving}
            className="w-full bg-[#AA7D6E] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50">
            {saving ? "सेव हो रहा है..." : "भाव सेव करें"}
          </button>
        </div>

        <h2 className="font-black text-zinc-700 text-sm uppercase tracking-widest">पुराने भाव</h2>
        {rows.length === 0 && <p className="text-center text-zinc-400 py-8">कोई भाव नहीं</p>}
        {rows.map(row => (
          <div key={row.id} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-black text-zinc-800">{row.metal} — {row.purity}</p>
              <p className="text-xs text-zinc-400">{new Date(row.updatedAt).toLocaleDateString("hi-IN")}</p>
            </div>
            <p className="text-xl font-black text-[#AA7D6E]">₹{row.price}</p>
          </div>
        ))}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🏠</span><span className="text-[10px] font-bold">होम</span>
        </Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🏦</span><span className="text-[10px] font-bold">गिरवी</span>
        </Link>
        <Link href="/dashboard/karigar" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🔨</span><span className="text-[10px] font-bold">कारीगर</span>
        </Link>
        <Link href="/dashboard/bhav" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]">
          <span className="text-xl">📈</span><span className="text-[10px] font-bold">भाव</span>
        </Link>
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span>
        </Link>
      </nav>
    </div>
  );
}