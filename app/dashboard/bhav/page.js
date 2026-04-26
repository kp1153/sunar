"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const METALS = [
  { label: "सोना", value: "सोना", icon: "🥇" },
  { label: "चाँदी", value: "चाँदी", icon: "🥈" },
];
const PURITIES = {
  सोना: ["24K", "22K", "18K", "916", "750"],
  चाँदी: ["999", "925", "800"],
};

export default function BhavPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ metal: "सोना", purity: "22K", price: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/bhav").then((r) => r.json());
      if (Array.isArray(data)) setRows(data);
    } catch {
      setError("भाव लोड नहीं हो सका। दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // metal बदलने पर purity reset
  const handleMetalChange = (metal) => {
    const firstPurity = PURITIES[metal][0];
    setForm({ ...form, metal, purity: firstPurity, price: "" });
  };

  const submit = async () => {
    if (!form.price || parseFloat(form.price) <= 0) {
      setError("सही भाव डालें");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/bhav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setForm({ ...form, price: "" });
      await load();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("सेव नहीं हो सका। दोबारा कोशिश करें।");
    } finally {
      setSaving(false);
    }
  };

  // आज का सोना 22K निकालो
  const gold22k = rows.find((r) => r.metal === "सोना" && r.purity === "22K");
  const silver999 = rows.find((r) => r.metal === "चाँदी" && r.purity === "999");

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">
            ← वापस
          </Link>
          <h1 className="text-lg font-black text-zinc-800">📈 आज का भाव</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* आज का quick summary */}
        {(gold22k || silver999) && (
          <div className="grid grid-cols-2 gap-3">
            {gold22k && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-amber-600 font-bold uppercase">
                  🥇 सोना 22K
                </p>
                <p className="text-2xl font-black text-zinc-800 mt-1">
                  ₹{gold22k.price.toLocaleString("hi-IN")}
                </p>
                <p className="text-xs text-zinc-400">प्रति 10 ग्राम</p>
              </div>
            )}
            {silver999 && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-zinc-500 font-bold uppercase">
                  🥈 चाँदी 999
                </p>
                <p className="text-2xl font-black text-zinc-800 mt-1">
                  ₹{silver999.price.toLocaleString("hi-IN")}
                </p>
                <p className="text-xs text-zinc-400">प्रति 10 ग्राम</p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
          <h2 className="font-black text-zinc-800">भाव अपडेट करें</h2>

          {/* Metal selector */}
          <div className="grid grid-cols-2 gap-2">
            {METALS.map((m) => (
              <button
                key={m.value}
                onClick={() => handleMetalChange(m.value)}
                className={`py-3 rounded-xl font-bold text-sm transition ${
                  form.metal === m.value
                    ? "bg-[#AA7D6E] text-white"
                    : "bg-zinc-50 text-zinc-600 border border-zinc-200"
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Purity selector */}
          <div className="flex flex-wrap gap-2">
            {PURITIES[form.metal].map((p) => (
              <button
                key={p}
                onClick={() => setForm({ ...form, purity: p })}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                  form.purity === p
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-50 text-zinc-600 border border-zinc-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg">
              ₹
            </span>
            <input
              type="number"
              placeholder="भाव (प्रति 10 ग्राम)"
              value={form.price}
              onChange={(e) => {
                setForm({ ...form, price: e.target.value });
                setError("");
              }}
              className="w-full pl-8 pr-4 py-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base font-bold focus:ring-[#AA7D6E]"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">⚠️ {error}</p>
          )}

          <button
            onClick={submit}
            disabled={saving}
            className="w-full bg-[#AA7D6E] text-white font-black py-4 rounded-2xl text-base disabled:opacity-50 transition active:scale-95"
          >
            {saving ? "⏳ सेव हो रहा है..." : saved ? "✅ सेव हो गया!" : "भाव सेव करें"}
          </button>
        </div>

        {/* All rates */}
        <h2 className="font-black text-zinc-600 text-sm uppercase tracking-widest">
          सभी भाव
        </h2>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-zinc-100 animate-pulse h-16" />
            ))}
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📈</p>
            <p className="text-zinc-400 font-medium">
              अभी कोई भाव नहीं है। ऊपर से डालें।
            </p>
          </div>
        )}

        {!loading &&
          rows.map((row) => (
            <div
              key={row.id}
              className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-black text-zinc-800">
                  {row.metal === "सोना" ? "🥇" : "🥈"} {row.metal} —{" "}
                  {row.purity}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {new Date(row.updatedAt).toLocaleString("hi-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#AA7D6E]">
                  ₹{row.price.toLocaleString("hi-IN")}
                </p>
                <p className="text-xs text-zinc-400">/ 10g</p>
              </div>
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
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span>
        </Link>
        <Link href="/dashboard/karigar" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🔨</span><span className="text-[10px] font-bold">कारीगर</span>
        </Link>
        <Link href="/dashboard/bhav" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]">
          <span className="text-xl">📈</span><span className="text-[10px] font-bold">भाव</span>
        </Link>
      </nav>
    </div>
  );
}