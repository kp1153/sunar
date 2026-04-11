"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function KarigarPage() {
  const [karigars, setKarigars] = useState([]);
  const [works, setWorks] = useState([]);
  const [showKarigar, setShowKarigar] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [returnShow, setReturnShow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [karigarForm, setKarigarForm] = useState({ name: "", phone: "" });
  const [workForm, setWorkForm] = useState({ karigarId: "", description: "", metalType: "सोना", issuedWeight: "" });
  const [returnForm, setReturnForm] = useState({ returnedWeight: "", labourCharge: "" });

  const loadKarigars = () => fetch("/api/karigar").then(r => r.json()).then(data => { if (Array.isArray(data)) setKarigars(data); });
  const loadWorks = () => fetch("/api/karigar/work").then(r => r.json()).then(data => { if (Array.isArray(data)) setWorks(data); });

  useEffect(() => { loadKarigars(); loadWorks(); }, []);

  const addKarigar = async () => {
    if (!karigarForm.name) return;
    await fetch("/api/karigar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(karigarForm) });
    setShowKarigar(false);
    setKarigarForm({ name: "", phone: "" });
    loadKarigars();
  };

  const addWork = async () => {
    if (!workForm.karigarId || !workForm.description || !workForm.issuedWeight) return;
    await fetch("/api/karigar/work", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(workForm) });
    setShowWork(false);
    setWorkForm({ karigarId: "", description: "", metalType: "सोना", issuedWeight: "" });
    loadWorks();
  };

  const returnWork = async () => {
    if (!returnForm.returnedWeight) return;
    await fetch("/api/karigar/work", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, ...returnForm }) });
    setReturnShow(false);
    setSelected(null);
    setReturnForm({ returnedWeight: "", labourCharge: "" });
    loadWorks();
  };

  const pending = works.filter(w => w.status === "pending");
  const done = works.filter(w => w.status === "done");

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
            <h1 className="text-lg font-black text-zinc-800">🔨 कारीगर</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowKarigar(true)} className="bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-xl">+ कारीगर</button>
            <button onClick={() => setShowWork(true)} className="bg-[#AA7D6E] text-white text-xs font-bold px-3 py-2 rounded-xl">+ काम</button>
          </div>
        </div>
      </header>

      {showKarigar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <h2 className="text-lg font-black text-zinc-800">नया कारीगर</h2>
            <input placeholder="कारीगर का नाम *" value={karigarForm.name} onChange={e => setKarigarForm({...karigarForm, name: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" />
            <input placeholder="मोबाइल नंबर" value={karigarForm.phone} onChange={e => setKarigarForm({...karigarForm, phone: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="tel" />
            <div className="flex gap-3">
              <button onClick={addKarigar} className="flex-1 bg-[#AA7D6E] text-white font-bold py-4 rounded-2xl">सेव करें</button>
              <button onClick={() => setShowKarigar(false)} className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-4 rounded-2xl">रद्द करें</button>
            </div>
          </div>
        </div>
      )}

      {showWork && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-zinc-800">काम सौंपें</h2>
            <select value={workForm.karigarId} onChange={e => setWorkForm({...workForm, karigarId: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base">
              <option value="">कारीगर चुनें *</option>
              {karigars.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            <textarea placeholder="काम का विवरण * (जैसे: सोने का हार बनाना)" value={workForm.description} onChange={e => setWorkForm({...workForm, description: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base h-20" />
            <div className="grid grid-cols-2 gap-3">
              <select value={workForm.metalType} onChange={e => setWorkForm({...workForm, metalType: e.target.value})}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base">
                <option>सोना</option>
                <option>चाँदी</option>
              </select>
              <input placeholder="दिया वजन (ग्राम) *" value={workForm.issuedWeight} onChange={e => setWorkForm({...workForm, issuedWeight: e.target.value})}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" step="0.01" />
            </div>
            <div className="flex gap-3">
              <button onClick={addWork} className="flex-1 bg-[#AA7D6E] text-white font-bold py-4 rounded-2xl">सेव करें</button>
              <button onClick={() => setShowWork(false)} className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-4 rounded-2xl">रद्द करें</button>
            </div>
          </div>
        </div>
      )}

      {returnShow && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <h2 className="text-lg font-black text-zinc-800">काम वापस लें</h2>
            <p className="text-zinc-500 text-sm">{selected.description} — {selected.issuedWeight}g दिया था</p>
            <input placeholder="वापस वजन (ग्राम) *" value={returnForm.returnedWeight} onChange={e => setReturnForm({...returnForm, returnedWeight: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" step="0.01" />
            <input placeholder="मजदूरी ₹" value={returnForm.labourCharge} onChange={e => setReturnForm({...returnForm, labourCharge: e.target.value})}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base" type="number" />
            <div className="flex gap-3">
              <button onClick={returnWork} className="flex-1 bg-[#AA7D6E] text-white font-bold py-4 rounded-2xl">सेव करें</button>
              <button onClick={() => setReturnShow(false)} className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-4 rounded-2xl">रद्द करें</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {karigars.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {karigars.map(k => (
              <div key={k.id} className="bg-white rounded-2xl px-4 py-2 border border-zinc-100 shadow-sm flex-shrink-0 text-sm font-bold text-zinc-700">
                🔨 {k.name}
              </div>
            ))}
          </div>
        )}

        <h2 className="font-black text-zinc-700 text-sm uppercase tracking-widest">चल रहा काम ({pending.length})</h2>
        {pending.length === 0 && <p className="text-center text-zinc-400 py-8">कोई काम नहीं चल रहा</p>}
        {pending.map(w => (
          <div key={w.id} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-black text-zinc-800">{w.karigarName || "कारीगर"}</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">{w.metalType}</span>
            </div>
            <p className="text-zinc-500 text-sm">{w.description}</p>
            <p className="text-zinc-400 text-xs">दिया: {w.issuedWeight}g</p>
            <button onClick={() => { setSelected(w); setReturnShow(true); }}
              className="w-full bg-zinc-800 text-white text-sm font-bold py-2 rounded-xl">
              ✅ काम वापस लें
            </button>
          </div>
        ))}

        {done.length > 0 && (
          <>
            <h2 className="font-black text-zinc-400 text-sm uppercase tracking-widest mt-4">पूरा काम ({done.length})</h2>
            {done.map(w => (
              <div key={w.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 opacity-60">
                <p className="font-bold text-zinc-600">{w.karigarName}</p>
                <p className="text-zinc-400 text-sm">{w.description} — वापस: {w.returnedWeight}g | मजदूरी: ₹{w.labourCharge}</p>
              </div>
            ))}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🏠</span><span className="text-[10px] font-bold">होम</span>
        </Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🏦</span><span className="text-[10px] font-bold">गिरवी</span>
        </Link>
        <Link href="/dashboard/karigar" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]">
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