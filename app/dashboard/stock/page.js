"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StockPage() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState("list");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastBarcode, setLastBarcode] = useState("");

  const [form, setForm] = useState({
    name: "",
    metalType: "सोना",
    purity: "22K",
    weight: "",
    makingCharge: "",
    hallmarkNo: "",
    huid: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await fetch("/api/stock").then((r) => r.json());
    if (Array.isArray(data)) setList(data);
  };

  const save = async () => {
    if (!form.name.trim()) { setError("सामान का नाम डालें"); return; }
    if (!form.weight || parseFloat(form.weight) <= 0) { setError("वजन डालें"); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setLastBarcode(data.barcode);
      setForm({ name: "", metalType: "सोना", purity: "22K", weight: "", makingCharge: "", hallmarkNo: "", huid: "" });
      await load();
      setTimeout(() => setLastBarcode(""), 8000);
    } catch {
      setError("सेव नहीं हो सका");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("इस सामान को stock से हटाना है?")) return;
    await fetch(`/api/stock?id=${id}`, { method: "DELETE" });
    await load();
  };

  const purities = form.metalType === "सोना" ? ["24K", "22K", "18K", "916", "750"] : ["999", "925", "800"];

  const totalWeight = list.filter((i) => i.status === "available")
    .reduce((s, i) => s + (i.weight || 0), 0);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
          <h1 className="text-lg font-black text-zinc-800">📦 स्टॉक</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl">
          <button onClick={() => setTab("list")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${tab === "list" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"}`}>
            📋 सूची ({list.length})
          </button>
          <button onClick={() => setTab("new")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${tab === "new" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"}`}>
            + नया सामान
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {tab === "new" && (
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
            <input placeholder="सामान का नाम * (जैसे: सोने का हार)" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />

            <div className="flex gap-2">
              {["सोना", "चाँदी"].map((m) => (
                <button key={m}
                  onClick={() => setForm({ ...form, metalType: m, purity: m === "सोना" ? "22K" : "999" })}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition ${form.metalType === m ? "bg-[#AA7D6E] text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-600"}`}>
                  {m === "सोना" ? "🥇" : "🥈"} {m}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {purities.map((p) => (
                <button key={p} onClick={() => setForm({ ...form, purity: p })}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition ${form.purity === p ? "bg-zinc-800 text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-500"}`}>
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="वजन (g) *" value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" step="0.01" />
              <input placeholder="मेकिंग चार्ज ₹" value={form.makingCharge}
                onChange={(e) => setForm({ ...form, makingCharge: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" />
            </div>

            <input placeholder="हॉलमार्क नंबर (वैकल्पिक)" value={form.hallmarkNo}
              onChange={(e) => setForm({ ...form, hallmarkNo: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />

            <input placeholder="HUID नंबर (वैकल्पिक)" value={form.huid}
              onChange={(e) => setForm({ ...form, huid: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />

            {error && <p className="text-red-500 text-sm font-medium">⚠️ {error}</p>}

            {lastBarcode && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-green-700 font-bold">✅ नया बारकोड बना:</p>
                <p className="font-mono font-black text-green-800 text-xl mt-1">{lastBarcode}</p>
                <p className="text-[10px] text-green-600 mt-1">printer से छाप कर सामान पर चिपकाएं</p>
              </div>
            )}

            <button onClick={save} disabled={saving}
              className="w-full bg-[#AA7D6E] text-white font-black py-4 rounded-2xl text-base active:scale-95 transition disabled:opacity-50">
              {saving ? "⏳..." : "💾 stock में जोड़ें"}
            </button>
          </div>
        )}

        {tab === "list" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-medium">उपलब्ध सामान</p>
                <p className="text-2xl font-black text-zinc-800 mt-1">{list.filter((i) => i.status === "available").length}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-medium">कुल वजन</p>
                <p className="text-2xl font-black text-[#AA7D6E] mt-1">{totalWeight.toFixed(2)}g</p>
              </div>
            </div>

            {list.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-zinc-400 font-medium">stock खाली है</p>
                <button onClick={() => setTab("new")} className="mt-4 bg-[#AA7D6E] text-white font-bold px-6 py-3 rounded-xl text-sm">
                  + पहला सामान जोड़ें
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {list.map((it) => (
                  <div key={it.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${it.status === "sold" ? "border-zinc-200 opacity-60" : "border-zinc-100"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-black text-zinc-800">{it.name}</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {it.metalType} {it.purity} • {it.weight}g
                          {it.makingCharge > 0 && ` • मेकिंग ₹${it.makingCharge}`}
                        </p>
                        {it.hallmarkNo && (
                          <p className="text-xs text-zinc-400">हॉलमार्क: {it.hallmarkNo}</p>
                        )}
                        <p className="font-mono text-[10px] text-zinc-500 mt-1">{it.barcode}</p>
                      </div>
                      <div className="text-right">
                        {it.status === "sold" ? (
                          <span className="text-xs bg-zinc-100 text-zinc-500 font-bold px-2 py-1 rounded-full">बिक गया</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">उपलब्ध</span>
                        )}
                      </div>
                    </div>
                    {it.status !== "sold" && (
                      <button onClick={() => remove(it.id)} className="mt-2 text-xs text-red-500 font-bold">🗑 मिटाओ</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">होम</span></Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🏦</span><span className="text-[10px] font-bold">गिरवी</span></Link>
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span></Link>
        <Link href="/dashboard/urd" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">♻️</span><span className="text-[10px] font-bold">पुराना</span></Link>
        <Link href="/dashboard/stock" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]"><span className="text-xl">📦</span><span className="text-[10px] font-black">स्टॉक</span></Link>
      </nav>
    </div>
  );
}