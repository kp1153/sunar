"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function calculateInterest(amount, rate, startDate) {
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.ceil(Math.abs(today - start) / (1000 * 60 * 60 * 24));
  const months = diffDays / 30;
  const interest = Math.round((amount * rate * months) / 100);
  return { interest, total: amount + interest, days: diffDays };
}

export default function GirviPage() {
  const [rows, setRows] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", itemDetails: "", loanAmount: "", interestRate: "1.5" });

  const load = () => fetch("/api/girvi").then(r => r.json()).then(data => { if (Array.isArray(data)) setRows(data); });
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.customerName || !form.itemDetails || !form.loanAmount) return;
    await fetch("/api/girvi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShow(false);
    setForm({ customerName: "", customerPhone: "", itemDetails: "", loanAmount: "", interestRate: "1.5" });
    load();
  };

  const close = async (id) => {
    if (!confirm("गिरवी वापस कर दी?")) return;
    await fetch("/api/girvi", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const active = rows.filter(r => r.status === "active");
  const closed = rows.filter(r => r.status === "closed");

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
            <h1 className="text-lg font-black text-zinc-800">🏦 गिरवी खाता</h1>
          </div>
          <button onClick={() => setShow(true)} className="bg-[#AA7D6E] text-white text-sm font-bold px-4 py-2 rounded-xl">+ नई एंट्री</button>
        </div>
      </header>

      {show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-zinc-800">नई गिरवी एंट्री</h2>
            <input placeholder="ग्राहक का नाम *" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />
            <input placeholder="मोबाइल नंबर" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="tel" />
            <textarea placeholder="गहने का विवरण * (जैसे: सोने की अंगूठी 5 ग्राम)" value={form.itemDetails} onChange={e => setForm({...form, itemDetails: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base h-20" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="दिया गया पैसा ₹ *" value={form.loanAmount} onChange={e => setForm({...form, loanAmount: e.target.value})}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" />
              <input placeholder="ब्याज % प्रति माह" value={form.interestRate} onChange={e => setForm({...form, interestRate: e.target.value})}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" step="0.1" />
            </div>
            <div className="flex gap-3">
              <button onClick={submit} className="flex-1 bg-[#AA7D6E] text-white font-bold py-4 rounded-2xl text-base">सेव करें</button>
              <button onClick={() => setShow(false)} className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-4 rounded-2xl text-base">रद्द करें</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <h2 className="font-black text-zinc-700 text-sm uppercase tracking-widest">सक्रिय गिरवी ({active.length})</h2>
        {active.length === 0 && <p className="text-center text-zinc-400 py-8">कोई सक्रिय गिरवी नहीं</p>}
        {active.map(row => {
          const calc = calculateInterest(row.loanAmount, row.interestRate, row.entryDate);
          return (
            <div key={row.id} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-black text-zinc-800 text-base">{row.customerName}</p>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">{calc.days} दिन</span>
              </div>
              <p className="text-zinc-500 text-sm">{row.itemDetails}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-50 rounded-xl p-2">
                  <p className="text-xs text-zinc-400">मूलधन</p>
                  <p className="font-black text-zinc-800">₹{row.loanAmount}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-2">
                  <p className="text-xs text-zinc-400">ब्याज</p>
                  <p className="font-black text-red-500">₹{calc.interest}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2">
                  <p className="text-xs text-zinc-400">कुल</p>
                  <p className="font-black text-[#AA7D6E]">₹{calc.total}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {row.customerPhone && (
                  <a href={`https://wa.me/91${row.customerPhone}?text=नमस्ते ${row.customerName} जी, आपकी गिरवी का हिसाब: मूलधन ₹${row.loanAmount}, ब्याज ₹${calc.interest}, कुल ₹${calc.total}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-green-500 text-white text-sm font-bold py-2 rounded-xl text-center">
                    💬 WhatsApp
                  </a>
                )}
                <button onClick={() => close(row.id)} className="flex-1 bg-zinc-800 text-white text-sm font-bold py-2 rounded-xl">
                  ✅ वापस मिली
                </button>
              </div>
            </div>
          );
        })}

        {closed.length > 0 && (
          <>
            <h2 className="font-black text-zinc-400 text-sm uppercase tracking-widest mt-6">बंद गिरवी ({closed.length})</h2>
            {closed.map(row => (
              <div key={row.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 opacity-60">
                <p className="font-bold text-zinc-600">{row.customerName}</p>
                <p className="text-zinc-400 text-sm">{row.itemDetails} — ₹{row.loanAmount}</p>
              </div>
            ))}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🏠</span><span className="text-[10px] font-bold">होम</span>
        </Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]">
          <span className="text-xl">🏦</span><span className="text-[10px] font-bold">गिरवी</span>
        </Link>
        <Link href="/dashboard/karigar" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🔨</span><span className="text-[10px] font-bold">कारीगर</span>
        </Link>
        <Link href="/dashboard/bhav" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">📈</span><span className="text-[10px] font-bold">भाव</span>
        </Link>
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span>
        </Link>
      </nav>
    </div>
  );
}