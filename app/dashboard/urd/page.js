"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function UrdPage() {
  const [list, setList] = useState([]);
  const [bhav, setBhav] = useState([]);
  const [tab, setTab] = useState("new");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    idProof: "आधार",
    idNumber: "",
    metalType: "सोना",
    purity: "22K",
    weight: "",
    ratePerTen: "",
    paymentMode: "नकद",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/bhav").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setBhav(d);
    });
    loadList();
  }, []);

  const loadList = async () => {
    const data = await fetch("/api/urd").then((r) => r.json());
    if (Array.isArray(data)) setList(data);
  };

  const getCurrentRate = () => {
    const m = bhav.find((b) => b.metal === form.metalType && b.purity === form.purity);
    return m ? m.price : 0;
  };

  // पुराने सोने पर 10% कम भाव default — सुनार चाहे तो override करे
  useEffect(() => {
    const r = getCurrentRate();
    if (r > 0) {
      setForm((f) => ({ ...f, ratePerTen: String(Math.round(r * 0.9)) }));
    }
  }, [form.metalType, form.purity, bhav]);

  const totalAmount = (() => {
    const w = parseFloat(form.weight);
    const r = parseFloat(form.ratePerTen);
    if (!w || !r) return 0;
    return Math.round((w * r) / 10);
  })();

  const save = async () => {
    if (!form.customerName.trim()) { setError("ग्राहक का नाम डालें"); return; }
    if (!form.weight || parseFloat(form.weight) <= 0) { setError("वजन डालें"); return; }
    if (!form.ratePerTen || parseFloat(form.ratePerTen) <= 0) { setError("भाव डालें"); return; }

    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/urd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, totalAmount }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setForm({
        customerName: "", customerPhone: "", idProof: "आधार", idNumber: "",
        metalType: "सोना", purity: "22K", weight: "", ratePerTen: "",
        paymentMode: "नकद", notes: "",
      });
      await loadList();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("सेव नहीं हो सका");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("इस खरीदी को मिटाना है?")) return;
    await fetch(`/api/urd?id=${id}`, { method: "DELETE" });
    await loadList();
  };

  const purities = form.metalType === "सोना"
    ? ["24K", "22K", "18K", "916", "750"]
    : ["999", "925", "800"];

  const totalSpent = list.reduce((s, x) => s + (x.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
          <h1 className="text-lg font-black text-zinc-800">♻️ पुराना खरीदा</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl">
          <button onClick={() => setTab("new")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${tab === "new" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"}`}>
            + नई खरीदी
          </button>
          <button onClick={() => setTab("history")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${tab === "history" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"}`}>
            📋 इतिहास ({list.length})
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {tab === "new" && (
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
            <input placeholder="ग्राहक का नाम *" value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />

            <input placeholder="मोबाइल नंबर" value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="tel" />

            <div className="grid grid-cols-2 gap-2">
              <select value={form.idProof}
                onChange={(e) => setForm({ ...form, idProof: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base">
                <option>आधार</option>
                <option>पैन</option>
                <option>वोटर आईडी</option>
                <option>ड्राइविंग लाइसेंस</option>
              </select>
              <input placeholder="नंबर" value={form.idNumber}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />
            </div>

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
              <input placeholder="भाव ₹ / 10g *" value={form.ratePerTen}
                onChange={(e) => setForm({ ...form, ratePerTen: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" />
            </div>

            {getCurrentRate() > 0 && (
              <div className="text-xs text-zinc-500 -mt-2">
                आज का भाव: ₹{getCurrentRate().toLocaleString("hi-IN")} (10% कम default लगाया)
              </div>
            )}

            <div className="flex gap-2">
              {["नकद", "UPI", "बैंक"].map((p) => (
                <button key={p} onClick={() => setForm({ ...form, paymentMode: p })}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${form.paymentMode === p ? "bg-zinc-800 text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-500"}`}>
                  {p}
                </button>
              ))}
            </div>

            <textarea placeholder="कुछ नोट (वैकल्पिक)" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" rows="2" />

            {totalAmount > 0 && (
              <div className="bg-[#AA7D6E]/10 rounded-2xl p-4 flex justify-between items-center">
                <span className="font-black text-zinc-700">देनी रकम</span>
                <span className="font-black text-[#AA7D6E] text-2xl">₹{totalAmount.toLocaleString("hi-IN")}</span>
              </div>
            )}

            {error && <p className="text-red-500 text-sm font-medium">⚠️ {error}</p>}
            {saved && <p className="text-green-600 text-sm font-bold">✅ सेव हो गया</p>}

            <button onClick={save} disabled={saving}
              className="w-full bg-[#AA7D6E] text-white font-black py-4 rounded-2xl text-base active:scale-95 transition disabled:opacity-50">
              {saving ? "⏳..." : "💾 खरीदी सेव करें"}
            </button>
          </div>
        )}

        {tab === "history" && (
          <>
            <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex justify-between">
              <span className="text-zinc-500 font-medium">कुल खर्च</span>
              <span className="font-black text-[#AA7D6E] text-lg">₹{totalSpent.toLocaleString("hi-IN")}</span>
            </div>
            {list.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">♻️</p>
                <p className="text-zinc-400 font-medium">अभी तक कोई खरीदी नहीं</p>
              </div>
            ) : (
              <div className="space-y-3">
                {list.map((u) => (
                  <div key={u.id} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-black text-zinc-800">{u.customerName}</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {u.metalType} {u.purity} • {u.weight}g • {u.paymentMode}
                        </p>
                        {u.idNumber && (
                          <p className="text-xs text-zinc-400">{u.idProof}: {u.idNumber}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#AA7D6E] text-lg">₹{Math.round(u.totalAmount).toLocaleString("hi-IN")}</p>
                        <p className="text-xs text-zinc-400">
                          {new Date(u.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => remove(u.id)} className="mt-2 text-xs text-red-500 font-bold">🗑 मिटाओ</button>
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
        <Link href="/dashboard/urd" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]"><span className="text-xl">♻️</span><span className="text-[10px] font-black">पुराना</span></Link>
        <Link href="/dashboard/stock" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">📦</span><span className="text-[10px] font-bold">स्टॉक</span></Link>
      </nav>
    </div>
  );
}