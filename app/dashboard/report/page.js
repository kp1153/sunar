"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReportPage() {
  const [period, setPeriod] = useState("today");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sales-report?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [period]);

  const periodLabel = period === "today" ? "आज" : period === "week" ? "इस हफ्ते" : "इस महीने";

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
          <h1 className="text-lg font-black text-zinc-800">📊 बिक्री रिपोर्ट</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-2 bg-white rounded-2xl p-1 border border-zinc-100">
          {[
            { k: "today", l: "आज" },
            { k: "week", l: "हफ्ता" },
            { k: "month", l: "महीना" },
          ].map((p) => (
            <button key={p.k} onClick={() => setPeriod(p.k)}
              className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${period === p.k ? "bg-[#AA7D6E] text-white" : "text-zinc-500"}`}>
              {p.l}
            </button>
          ))}
        </div>

        {loading || !data ? (
          <div className="text-center py-16 text-zinc-400">⏳ लोड हो रहा है...</div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#AA7D6E] to-[#8B5E4F] rounded-3xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-80 font-bold">{periodLabel} की बिक्री</p>
              <p className="text-4xl font-black mt-2">₹{data.totalSale.toLocaleString("hi-IN")}</p>
              <p className="text-sm opacity-90 mt-1">{data.billCount} बिल</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-medium">सोना बिका</p>
                <p className="text-2xl font-black text-amber-500 mt-1">{data.goldWeight}g</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-medium">चाँदी बिकी</p>
                <p className="text-2xl font-black text-zinc-500 mt-1">{data.silverWeight}g</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-medium">मेकिंग कमाई</p>
                <p className="text-2xl font-black text-green-600 mt-1">₹{data.totalMaking.toLocaleString("hi-IN")}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-medium">GST जमा</p>
                <p className="text-2xl font-black text-blue-600 mt-1">₹{data.totalGst.toLocaleString("hi-IN")}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-3">
              <h3 className="font-black text-zinc-800">💳 भुगतान का तरीका</h3>
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="font-medium text-zinc-600">💵 नकद</span>
                <span className="font-black text-zinc-800">₹{data.cashSales.toLocaleString("hi-IN")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="font-medium text-zinc-600">📱 UPI</span>
                <span className="font-black text-zinc-800">₹{data.upiSales.toLocaleString("hi-IN")}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-zinc-600">📝 उधार</span>
                <span className="font-black text-red-500">₹{data.udhaarSales.toLocaleString("hi-IN")}</span>
              </div>
            </div>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">होम</span></Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🏦</span><span className="text-[10px] font-bold">गिरवी</span></Link>
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span></Link>
        <Link href="/dashboard/urd" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">♻️</span><span className="text-[10px] font-bold">पुराना</span></Link>
        <Link href="/dashboard/stock" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">📦</span><span className="text-[10px] font-bold">स्टॉक</span></Link>
      </nav>
    </div>
  );
}