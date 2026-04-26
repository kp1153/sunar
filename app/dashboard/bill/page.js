"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BillPage() {
  const [bhav, setBhav] = useState([]);
  const [savedBills, setSavedBills] = useState([]);
  const [tab, setTab] = useState("new"); // new | history
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    item: "",
    metalType: "सोना",
    grossWeight: "",
    netWeight: "",
    purity: "22K",
    makingCharge: "",
    paymentMode: "नकद",
  });

  useEffect(() => {
    fetch("/api/bhav").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setBhav(data);
    });
    loadBills();
  }, []);

  const loadBills = async () => {
    const data = await fetch("/api/bills").then((r) => r.json());
    if (Array.isArray(data)) setSavedBills(data);
  };

  const getCurrentRate = () => {
    const match = bhav.find(
      (b) => b.metal === form.metalType && b.purity === form.purity
    );
    return match ? match.price : 0;
  };

  const calculate = () => {
    if (!form.customerName.trim()) { setError("ग्राहक का नाम डालें"); return; }
    if (!form.item.trim()) { setError("सामान का नाम डालें"); return; }
    if (!form.netWeight || parseFloat(form.netWeight) <= 0) { setError("नेट वजन डालें"); return; }

    const rate = getCurrentRate();
    if (rate === 0) { setError("पहले भाव page पर आज का भाव डालें"); return; }

    setError("");
    const net = parseFloat(form.netWeight);
    const making = parseFloat(form.makingCharge) || 0;
    const metalValue = (rate * net) / 10;
    const subtotal = metalValue + making;
    const gst = Math.round(subtotal * 0.03);
    const total = Math.round(subtotal + gst);
    setResult({ rate, metalValue: Math.round(metalValue), making, subtotal: Math.round(subtotal), gst, total });
  };

  const saveBill = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          item: form.item,
          metalType: form.metalType,
          purity: form.purity,
          grossWeight: form.grossWeight,
          netWeight: form.netWeight,
          ratePerTen: result.rate,
          metalValue: result.metalValue,
          makingCharge: result.making,
          gst: result.gst,
          totalAmount: result.total,
          paymentMode: form.paymentMode,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      await loadBills();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("बिल सेव नहीं हो सका।");
    } finally {
      setSaving(false);
    }
  };

  const shareWhatsApp = () => {
    if (!result || !form.customerPhone) return;
    const msg =
      `*स्वर्णशिल्पी ज्वेलर्स* 💎%0A` +
      `━━━━━━━━━━━━━━%0A` +
      `ग्राहक: ${form.customerName}%0A` +
      `सामान: ${form.item}%0A` +
      `धातु: ${form.metalType} ${form.purity}%0A` +
      `नेट वजन: ${form.netWeight}g%0A` +
      `━━━━━━━━━━━━━━%0A` +
      `धातु मूल्य: ₹${result.metalValue}%0A` +
      `मेकिंग चार्ज: ₹${result.making}%0A` +
      `GST (3%%): ₹${result.gst}%0A` +
      `━━━━━━━━━━━━━━%0A` +
      `*कुल: ₹${result.total}*%0A` +
      `भुगतान: ${form.paymentMode}%0A%0A` +
      `धन्यवाद! 🙏`;
    window.open(`https://wa.me/91${form.customerPhone}?text=${msg}`, "_blank");
  };

  const shareBill = async () => {
    if (!result) return;
    const text =
      `स्वर्णशिल्पी ज्वेलर्स\n` +
      `ग्राहक: ${form.customerName}\n` +
      `सामान: ${form.item} (${form.metalType} ${form.purity})\n` +
      `नेट वजन: ${form.netWeight}g\n` +
      `धातु मूल्य: ₹${result.metalValue}\n` +
      `मेकिंग: ₹${result.making}\n` +
      `GST: ₹${result.gst}\n` +
      `कुल: ₹${result.total}\n` +
      `भुगतान: ${form.paymentMode}`;

    if (navigator.share) {
      await navigator.share({ title: "बिल", text });
    }
  };

  const purities = form.metalType === "सोना"
    ? ["24K", "22K", "18K", "916", "750"]
    : ["999", "925", "800"];

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
          <h1 className="text-lg font-black text-zinc-800">🧾 बिल</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl">
          <button
            onClick={() => setTab("new")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${
              tab === "new" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"
            }`}
          >
            + नया बिल
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${
              tab === "history" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"
            }`}
          >
            📋 इतिहास ({savedBills.length})
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* New Bill Tab */}
        {tab === "new" && (
          <>
            <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
              <input
                placeholder="ग्राहक का नाम *"
                value={form.customerName}
                onChange={(e) => { setForm({ ...form, customerName: e.target.value }); setError(""); setResult(null); }}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base focus:ring-[#AA7D6E]"
              />
              <input
                placeholder="मोबाइल नंबर (WhatsApp के लिए)"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
                type="tel"
              />
              <input
                placeholder="सामान का नाम * (जैसे: सोने का हार)"
                value={form.item}
                onChange={(e) => { setForm({ ...form, item: e.target.value }); setResult(null); }}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base focus:ring-[#AA7D6E]"
              />

              {/* Metal selector */}
              <div className="flex gap-2">
                {["सोना", "चाँदी"].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      const newPurity = m === "सोना" ? "22K" : "999";
                      setForm({ ...form, metalType: m, purity: newPurity });
                      setResult(null);
                    }}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition ${
                      form.metalType === m ? "bg-[#AA7D6E] text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-600"
                    }`}
                  >
                    {m === "सोना" ? "🥇" : "🥈"} {m}
                  </button>
                ))}
              </div>

              {/* Purity selector */}
              <div className="flex flex-wrap gap-2">
                {purities.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setForm({ ...form, purity: p }); setResult(null); }}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                      form.purity === p ? "bg-zinc-800 text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="ग्रॉस वजन (g)"
                  value={form.grossWeight}
                  onChange={(e) => setForm({ ...form, grossWeight: e.target.value })}
                  className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
                  type="number" step="0.01"
                />
                <input
                  placeholder="नेट वजन (g) *"
                  value={form.netWeight}
                  onChange={(e) => { setForm({ ...form, netWeight: e.target.value }); setResult(null); }}
                  className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base focus:ring-[#AA7D6E]"
                  type="number" step="0.01"
                />
              </div>

              <input
                placeholder="मेकिंग चार्ज ₹"
                value={form.makingCharge}
                onChange={(e) => { setForm({ ...form, makingCharge: e.target.value }); setResult(null); }}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
                type="number"
              />

              {/* Payment mode */}
              <div className="flex gap-2">
                {["नकद", "UPI", "उधार"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, paymentMode: p })}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${
                      form.paymentMode === p ? "bg-zinc-800 text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-500"
                    }`}
                  >
                    {p === "नकद" ? "💵" : p === "UPI" ? "📱" : "📝"} {p}
                  </button>
                ))}
              </div>

              {getCurrentRate() > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2">
                  <span className="text-amber-500">📈</span>
                  <p className="text-sm font-bold text-amber-700">
                    {form.metalType} {form.purity} — ₹{getCurrentRate().toLocaleString("hi-IN")} / 10g
                  </p>
                </div>
              )}

              {error && <p className="text-red-500 text-sm font-medium">⚠️ {error}</p>}

              <button
                onClick={calculate}
                className="w-full bg-[#AA7D6E] text-white font-black py-4 rounded-2xl text-base active:scale-95 transition"
              >
                💰 हिसाब लगाओ
              </button>
            </div>

            {/* Bill Result */}
            {result && (
              <div className="bg-white rounded-2xl p-5 border-2 border-[#AA7D6E] shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-zinc-800 text-lg">💰 बिल</h2>
                  {saved && (
                    <span className="text-xs bg-green-100 text-green-600 font-black px-3 py-1 rounded-full">
                      ✅ सेव हो गया!
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">ग्राहक</span>
                    <span className="font-bold text-zinc-800">{form.customerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">सामान</span>
                    <span className="font-bold text-zinc-700">{form.item}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">धातु मूल्य ({form.netWeight}g @ ₹{result.rate}/10g)</span>
                    <span className="font-bold">₹{result.metalValue.toLocaleString("hi-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">मेकिंग चार्ज</span>
                    <span className="font-bold">₹{result.making.toLocaleString("hi-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">GST (3%)</span>
                    <span className="font-bold">₹{result.gst.toLocaleString("hi-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 mt-1">
                    <span className="font-black text-zinc-800 text-lg">कुल रकम</span>
                    <span className="font-black text-[#AA7D6E] text-2xl">
                      ₹{result.total.toLocaleString("hi-IN")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={saveBill}
                    disabled={saving || saved}
                    className="bg-zinc-800 text-white font-black py-3 rounded-xl text-sm disabled:opacity-50 active:scale-95 transition"
                  >
                    {saving ? "⏳..." : saved ? "✅ सेव" : "💾 सेव करें"}
                  </button>
                  {form.customerPhone ? (
                    <button
                      onClick={shareWhatsApp}
                      className="bg-green-500 text-white font-black py-3 rounded-xl text-sm active:scale-95 transition"
                    >
                      💬 WhatsApp
                    </button>
                  ) : (
                    <button
                      onClick={shareBill}
                      className="bg-blue-500 text-white font-black py-3 rounded-xl text-sm active:scale-95 transition"
                    >
                      📤 शेयर
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <>
            {savedBills.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🧾</p>
                <p className="text-zinc-400 font-medium">अभी तक कोई बिल नहीं बना</p>
                <button
                  onClick={() => setTab("new")}
                  className="mt-4 bg-[#AA7D6E] text-white font-bold px-6 py-3 rounded-xl text-sm"
                >
                  + पहला बिल बनाएं
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedBills.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-black text-zinc-800">{b.customerName}</p>
                        <p className="text-zinc-500 text-sm">{b.item}</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {b.metalType} {b.purity} • {b.netWeight}g • {b.paymentMode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#AA7D6E] text-lg">
                          ₹{Math.round(b.totalAmount).toLocaleString("hi-IN")}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {new Date(b.createdAt).toLocaleDateString("hi-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-300 mt-2 font-mono">{b.billNumber}</div>
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
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]"><span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span></Link>
        <Link href="/dashboard/karigar" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🔨</span><span className="text-[10px] font-bold">कारीगर</span></Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">⚙️</span><span className="text-[10px] font-bold">सेटिंग</span></Link>
      </nav>
    </div>
  );
}