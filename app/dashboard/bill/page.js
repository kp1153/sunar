"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BillPage() {
  const [bhav, setBhav] = useState([]);
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
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/bhav").then(r => r.json()).then(data => { if (Array.isArray(data)) setBhav(data); });
  }, []);

  const getCurrentRate = () => {
    const match = bhav.find(b => b.metal === form.metalType && b.purity === form.purity);
    return match ? match.price : 0;
  };

  const calculate = () => {
    const rate = getCurrentRate();
    const net = parseFloat(form.netWeight) || 0;
    const making = parseFloat(form.makingCharge) || 0;
    const metalValue = (rate * net) / 10;
    const subtotal = metalValue + making;
    const gst = Math.round(subtotal * 0.03);
    const total = Math.round(subtotal + gst);
    setResult({ rate, metalValue: Math.round(metalValue), making, subtotal: Math.round(subtotal), gst, total });
  };

  const sendWhatsApp = () => {
    if (!result || !form.customerPhone) return;
    const msg = `*स्वर्णशिल्पी ज्वेलर्स* 💎%0A%0Aग्राहक: ${form.customerName}%0Aसामान: ${form.item}%0Aधातु: ${form.metalType} ${form.purity}%0Aनेट वजन: ${form.netWeight}g%0Aधातु मूल्य: ₹${result.metalValue}%0Aमेकिंग चार्ज: ₹${result.making}%0AGST (3%%): ₹${result.gst}%0A*कुल: ₹${result.total}*%0A%0Aभुगतान: ${form.paymentMode}%0A%0Aधन्यवाद! 🙏`;
    window.open(`https://wa.me/91${form.customerPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
          <h1 className="text-lg font-black text-zinc-800">🧾 बिल बनाओ</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
          <input placeholder="ग्राहक का नाम *" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})}
            className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />
          <input placeholder="मोबाइल नंबर (WhatsApp के लिए)" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})}
            className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="tel" />
          <input placeholder="सामान का नाम (जैसे: सोने का हार)" value={form.item} onChange={e => setForm({...form, item: e.target.value})}
            className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.metalType} onChange={e => setForm({...form, metalType: e.target.value})}
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

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="ग्रॉस वजन (ग्राम)" value={form.grossWeight} onChange={e => setForm({...form, grossWeight: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" step="0.01" />
            <input placeholder="नेट वजन (ग्राम) *" value={form.netWeight} onChange={e => setForm({...form, netWeight: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" step="0.01" />
          </div>

          <input placeholder="मेकिंग चार्ज ₹" value={form.makingCharge} onChange={e => setForm({...form, makingCharge: e.target.value})}
            className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" />

          <select value={form.paymentMode} onChange={e => setForm({...form, paymentMode: e.target.value})}
            className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base">
            <option>नकद</option>
            <option>UPI</option>
            <option>उधार</option>
          </select>

          {getCurrentRate() > 0 && (
            <p className="text-xs text-zinc-400">आज का भाव: ₹{getCurrentRate()} / 10g</p>
          )}

          <button onClick={calculate} className="w-full bg-[#AA7D6E] text-white font-bold py-4 rounded-2xl text-base">
            हिसाब लगाओ
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-2xl p-5 border-2 border-[#AA7D6E] shadow-sm space-y-3">
            <h2 className="font-black text-zinc-800 text-lg">💰 बिल का हिसाब</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">धातु मूल्य ({form.netWeight}g @ ₹{result.rate}/10g)</span>
                <span className="font-bold">₹{result.metalValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">मेकिंग चार्ज</span>
                <span className="font-bold">₹{result.making}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">GST (3%)</span>
                <span className="font-bold">₹{result.gst}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-black text-zinc-800 text-base">कुल रकम</span>
                <span className="font-black text-[#AA7D6E] text-xl">₹{result.total}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => window.print()} className="bg-zinc-800 text-white font-bold py-3 rounded-xl text-sm">
                🖨️ प्रिंट करें
              </button>
              <button onClick={sendWhatsApp} className="bg-green-500 text-white font-bold py-3 rounded-xl text-sm">
                💬 WhatsApp
              </button>
            </div>
          </div>
        )}
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
        <Link href="/dashboard/bhav" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">📈</span><span className="text-[10px] font-bold">भाव</span>
        </Link>
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]">
          <span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span>
        </Link>
      </nav>
    </div>
  );
}