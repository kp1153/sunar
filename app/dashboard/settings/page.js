"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [form, setForm] = useState({ shopName: "", ownerName: "", phone: "", address: "", gstin: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data && data.shopName) setForm({
        shopName: data.shopName || "",
        ownerName: data.ownerName || "",
        phone: data.phone || "",
        address: data.address || "",
        gstin: data.gstin || "",
      });
    });
  }, []);

  const submit = async () => {
    setSaving(true);
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
          <h1 className="text-lg font-black text-zinc-800">⚙️ सेटिंग</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
          <h2 className="font-black text-zinc-800">दुकान की जानकारी</h2>
          <p className="text-zinc-400 text-sm">यह जानकारी बिल और रसीद पर छपेगी।</p>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">दुकान का नाम</label>
            <input placeholder="जैसे: श्री राम ज्वेलर्स" value={form.shopName} onChange={e => setForm({...form, shopName: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">मालिक का नाम</label>
            <input placeholder="जैसे: राम प्रसाद" value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">मोबाइल नंबर</label>
            <input placeholder="जैसे: 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="tel" />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">पता</label>
            <textarea placeholder="दुकान का पूरा पता" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base h-20" />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">GSTIN (वैकल्पिक)</label>
            <input placeholder="जैसे: 09AAAAA0000A1Z5" value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />
          </div>

          <button onClick={submit} disabled={saving}
            className="w-full bg-[#AA7D6E] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50">
            {saving ? "सेव हो रहा है..." : saved ? "✅ सेव हो गया!" : "सेटिंग सेव करें"}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <h2 className="font-black text-zinc-800 mb-3">खाता</h2>
          <a href="/api/auth/logout" className="block w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl text-base text-center border border-red-200">
            लॉगआउट करें
          </a>
        </div>
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
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]">
          <span className="text-xl">⚙️</span><span className="text-[10px] font-bold">सेटिंग</span>
        </Link>
      </nav>
    </div>
  );
}