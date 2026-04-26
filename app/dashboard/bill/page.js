"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { calcBillTotal } from "@/lib/billCalc";

export default function BillPage() {
  const [bhav, setBhav] = useState([]);
  const [savedBills, setSavedBills] = useState([]);
  const [tab, setTab] = useState("new");
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showOldGold, setShowOldGold] = useState(false);
  const [scanInput, setScanInput] = useState("");

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
    hallmarkNo: "",
    huid: "",
    oldGoldWeight: "",
    oldGoldPurity: "22K",
    oldGoldRate: "",
    stockItemId: null,
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

  const getCurrentRate = (metal, purity) => {
    const match = bhav.find((b) => b.metal === metal && b.purity === purity);
    return match ? match.price : 0;
  };

  // बारकोड scan/type — stock item auto-fill
  const findByBarcode = async () => {
    if (!scanInput.trim()) return;
    const res = await fetch(`/api/stock?barcode=${encodeURIComponent(scanInput.trim())}`);
    const item = await res.json();
    if (!item) {
      setError("इस बारकोड का सामान नहीं मिला");
      return;
    }
    setError("");
    setForm({
      ...form,
      item: item.name,
      metalType: item.metalType,
      purity: item.purity,
      netWeight: String(item.weight),
      makingCharge: item.makingCharge ? String(item.makingCharge) : "",
      hallmarkNo: item.hallmarkNo || "",
      huid: item.huid || "",
      stockItemId: item.id,
    });
    setScanInput("");
    setResult(null);
  };

  const calculate = () => {
    if (!form.customerName.trim()) { setError("ग्राहक का नाम डालें"); return; }
    if (!form.item.trim()) { setError("सामान का नाम डालें"); return; }
    if (!form.netWeight || parseFloat(form.netWeight) <= 0) { setError("नेट वजन डालें"); return; }

    const rate = getCurrentRate(form.metalType, form.purity);
    if (rate === 0) { setError("पहले भाव page पर आज का भाव डालें"); return; }

    let oldRate = 0;
    if (showOldGold && form.oldGoldWeight && parseFloat(form.oldGoldWeight) > 0) {
      oldRate = parseFloat(form.oldGoldRate) || (getCurrentRate("सोना", form.oldGoldPurity) * 0.9);
    }

    const out = calcBillTotal({
      netWeight: form.netWeight,
      ratePerTen: rate,
      makingCharge: form.makingCharge,
      oldGoldWeight: showOldGold ? form.oldGoldWeight : 0,
      oldGoldRate: oldRate,
    });

    if (out.error) { setError(out.error); return; }

    setError("");
    setResult({ ...out, rate, oldRate: Math.round(oldRate) });
  };

  const saveBill = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const payload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        item: form.item,
        metalType: form.metalType,
        purity: form.purity,
        grossWeight: form.grossWeight,
        netWeight: form.netWeight,
        ratePerTen: result.rate,
        metalValue: result.metalValue,
        makingCharge: parseFloat(form.makingCharge) || 0,
        gst: result.gst,
        totalAmount: result.totalAmount,
        paymentMode: form.paymentMode,
        hallmarkNo: form.hallmarkNo || null,
        huid: form.huid || null,
        oldGoldWeight: showOldGold && form.oldGoldWeight ? parseFloat(form.oldGoldWeight) : null,
        oldGoldPurity: showOldGold && form.oldGoldWeight ? form.oldGoldPurity : null,
        oldGoldRate: showOldGold && form.oldGoldWeight ? result.oldRate : null,
        oldGoldValue: showOldGold && form.oldGoldWeight ? result.oldGoldValue : null,
        netPayable: showOldGold && form.oldGoldWeight ? result.netPayable : result.totalAmount,
        stockItemId: form.stockItemId,
      };
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    const payable = showOldGold && form.oldGoldWeight ? result.netPayable : result.totalAmount;
    let msg =
      `*स्वर्णशिल्पी ज्वेलर्स* 💎%0A` +
      `━━━━━━━━━━━━━━%0A` +
      `ग्राहक: ${form.customerName}%0A` +
      `सामान: ${form.item}%0A` +
      `धातु: ${form.metalType} ${form.purity}%0A` +
      `नेट वजन: ${form.netWeight}g%0A`;
    if (form.hallmarkNo) msg += `हॉलमार्क: ${form.hallmarkNo}%0A`;
    msg += `━━━━━━━━━━━━━━%0A` +
      `धातु मूल्य: ₹${result.metalValue}%0A` +
      `मेकिंग चार्ज: ₹${parseFloat(form.makingCharge) || 0}%0A` +
      `GST (3%%): ₹${result.gst}%0A`;
    if (showOldGold && form.oldGoldWeight) {
      msg += `पुराना सोना (${form.oldGoldWeight}g): -₹${result.oldGoldValue}%0A`;
    }
    msg += `━━━━━━━━━━━━━━%0A` +
      `*देनी रकम: ₹${payable}*%0A` +
      `भुगतान: ${form.paymentMode}%0A%0A` +
      `धन्यवाद! 🙏`;
    window.open(`https://wa.me/91${form.customerPhone}?text=${msg}`, "_blank");
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

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl">
          <button onClick={() => setTab("new")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${tab === "new" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"}`}>
            + नया बिल
          </button>
          <button onClick={() => setTab("history")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${tab === "history" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"}`}>
            📋 इतिहास ({savedBills.length})
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {tab === "new" && (
          <>
            {/* बारकोड scan */}
            <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
              <div className="flex gap-2">
                <input placeholder="📦 बारकोड scan/type" value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && findByBarcode()}
                  className="flex-1 p-3 bg-zinc-50 rounded-xl ring-1 ring-zinc-200 outline-none text-sm font-mono" />
                <button onClick={findByBarcode}
                  className="bg-zinc-800 text-white font-black px-4 rounded-xl text-sm">
                  खोजो
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">stock से auto-fill होगा</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
              <input placeholder="ग्राहक का नाम *" value={form.customerName}
                onChange={(e) => { setForm({ ...form, customerName: e.target.value }); setError(""); setResult(null); }}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />
              <input placeholder="मोबाइल नंबर" value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="tel" />
              <input placeholder="सामान का नाम *" value={form.item}
                onChange={(e) => { setForm({ ...form, item: e.target.value }); setResult(null); }}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />

              <div className="flex gap-2">
                {["सोना", "चाँदी"].map((m) => (
                  <button key={m}
                    onClick={() => { setForm({ ...form, metalType: m, purity: m === "सोना" ? "22K" : "999" }); setResult(null); }}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition ${form.metalType === m ? "bg-[#AA7D6E] text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-600"}`}>
                    {m === "सोना" ? "🥇" : "🥈"} {m}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {purities.map((p) => (
                  <button key={p} onClick={() => { setForm({ ...form, purity: p }); setResult(null); }}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition ${form.purity === p ? "bg-zinc-800 text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-500"}`}>
                    {p}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="ग्रॉस (g)" value={form.grossWeight}
                  onChange={(e) => setForm({ ...form, grossWeight: e.target.value })}
                  className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" step="0.01" />
                <input placeholder="नेट (g) *" value={form.netWeight}
                  onChange={(e) => { setForm({ ...form, netWeight: e.target.value }); setResult(null); }}
                  className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" step="0.01" />
              </div>

              <input placeholder="मेकिंग चार्ज ₹" value={form.makingCharge}
                onChange={(e) => { setForm({ ...form, makingCharge: e.target.value }); setResult(null); }}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" />

              {/* हॉलमार्क */}
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="हॉलमार्क नंबर" value={form.hallmarkNo}
                  onChange={(e) => setForm({ ...form, hallmarkNo: e.target.value })}
                  className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-sm" />
                <input placeholder="HUID" value={form.huid}
                  onChange={(e) => setForm({ ...form, huid: e.target.value })}
                  className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-sm" />
              </div>

              {/* पुराना सोना toggle */}
              <button onClick={() => { setShowOldGold(!showOldGold); setResult(null); }}
                className={`w-full py-3 rounded-xl font-bold text-sm transition border-2 ${showOldGold ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-zinc-50 border-zinc-200 text-zinc-500"}`}>
                {showOldGold ? "✓" : "+"} पुराना सोना देना है?
              </button>

              {showOldGold && (
                <div className="bg-amber-50 rounded-2xl p-4 space-y-3 border border-amber-200">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="पुराना वजन (g)" value={form.oldGoldWeight}
                      onChange={(e) => { setForm({ ...form, oldGoldWeight: e.target.value }); setResult(null); }}
                      className="w-full p-3 bg-white rounded-xl outline-none text-sm" type="number" step="0.01" />
                    <select value={form.oldGoldPurity}
                      onChange={(e) => { setForm({ ...form, oldGoldPurity: e.target.value }); setResult(null); }}
                      className="w-full p-3 bg-white rounded-xl outline-none text-sm">
                      <option value="24K">24K</option>
                      <option value="22K">22K</option>
                      <option value="18K">18K</option>
                    </select>
                  </div>
                  <input placeholder={`भाव ₹/10g (खाली छोड़ें = आज का 90%)`}
                    value={form.oldGoldRate}
                    onChange={(e) => { setForm({ ...form, oldGoldRate: e.target.value }); setResult(null); }}
                    className="w-full p-3 bg-white rounded-xl outline-none text-sm" type="number" />
                </div>
              )}

              <div className="flex gap-2">
                {["नकद", "UPI", "उधार"].map((p) => (
                  <button key={p} onClick={() => setForm({ ...form, paymentMode: p })}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${form.paymentMode === p ? "bg-zinc-800 text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-500"}`}>
                    {p === "नकद" ? "💵" : p === "UPI" ? "📱" : "📝"} {p}
                  </button>
                ))}
              </div>

              {getCurrentRate(form.metalType, form.purity) > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2">
                  <span className="text-amber-500">📈</span>
                  <p className="text-sm font-bold text-amber-700">
                    {form.metalType} {form.purity} — ₹{getCurrentRate(form.metalType, form.purity).toLocaleString("hi-IN")} / 10g
                  </p>
                </div>
              )}

              {error && <p className="text-red-500 text-sm font-medium">⚠️ {error}</p>}

              <button onClick={calculate}
                className="w-full bg-[#AA7D6E] text-white font-black py-4 rounded-2xl text-base active:scale-95 transition">
                💰 हिसाब लगाओ
              </button>
            </div>

            {result && (
              <div className="bg-white rounded-2xl p-5 border-2 border-[#AA7D6E] shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-zinc-800 text-lg">💰 बिल</h2>
                  {saved && <span className="text-xs bg-green-100 text-green-600 font-black px-3 py-1 rounded-full">✅ सेव!</span>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">धातु मूल्य</span>
                    <span className="font-bold">₹{result.metalValue.toLocaleString("hi-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">मेकिंग</span>
                    <span className="font-bold">₹{(parseFloat(form.makingCharge) || 0).toLocaleString("hi-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">GST (3%)</span>
                    <span className="font-bold">₹{result.gst.toLocaleString("hi-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-zinc-500">कुल बिल</span>
                    <span className="font-bold">₹{result.totalAmount.toLocaleString("hi-IN")}</span>
                  </div>
                  {showOldGold && form.oldGoldWeight && (
                    <div className="flex justify-between text-sm text-amber-700">
                      <span>पुराना सोना ({form.oldGoldWeight}g)</span>
                      <span className="font-bold">- ₹{result.oldGoldValue.toLocaleString("hi-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 border-[#AA7D6E] pt-3 mt-1">
                    <span className="font-black text-zinc-800 text-lg">देनी रकम</span>
                    <span className="font-black text-[#AA7D6E] text-2xl">
                      ₹{(showOldGold && form.oldGoldWeight ? result.netPayable : result.totalAmount).toLocaleString("hi-IN")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={saveBill} disabled={saving || saved}
                    className="bg-zinc-800 text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">
                    {saving ? "⏳..." : saved ? "✅ सेव" : "💾 सेव"}
                  </button>
                  {form.customerPhone && (
                    <button onClick={shareWhatsApp}
                      className="bg-green-500 text-white font-black py-3 rounded-xl text-sm">
                      💬 WhatsApp
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "history" && (
          <>
            {savedBills.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🧾</p>
                <p className="text-zinc-400 font-medium">अभी तक कोई बिल नहीं</p>
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
                        {b.hallmarkNo && <p className="text-xs text-zinc-400">हॉलमार्क: {b.hallmarkNo}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#AA7D6E] text-lg">
                          ₹{Math.round(b.netPayable || b.totalAmount).toLocaleString("hi-IN")}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {new Date(b.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short" })}
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
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]"><span className="text-xl">🧾</span><span className="text-[10px] font-black">बिल</span></Link>
        <Link href="/dashboard/urd" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">♻️</span><span className="text-[10px] font-bold">पुराना</span></Link>
        <Link href="/dashboard/stock" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">📦</span><span className="text-[10px] font-bold">स्टॉक</span></Link>
      </nav>
    </div>
  );
}