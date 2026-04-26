"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function KarigarPage() {
  const [karigars, setKarigars] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showKarigar, setShowKarigar] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [returnShow, setReturnShow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeKarigar, setActiveKarigar] = useState(null); // filter by karigar
  const [karigarForm, setKarigarForm] = useState({ name: "", phone: "" });
  const [workForm, setWorkForm] = useState({ karigarId: "", description: "", metalType: "सोना", issuedWeight: "" });
  const [returnForm, setReturnForm] = useState({ returnedWeight: "", labourCharge: "" });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [k, w] = await Promise.all([
        fetch("/api/karigar").then((r) => r.json()),
        fetch("/api/karigar/work").then((r) => r.json()),
      ]);
      if (Array.isArray(k)) setKarigars(k);
      if (Array.isArray(w)) setWorks(w);
    } catch {
      setError("डेटा लोड नहीं हो सका।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const addKarigar = async () => {
    if (!karigarForm.name.trim()) { setError("कारीगर का नाम डालें"); return; }
    setSaving(true);
    try {
      await fetch("/api/karigar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(karigarForm),
      });
      setShowKarigar(false);
      setKarigarForm({ name: "", phone: "" });
      await loadAll();
    } catch {
      setError("सेव नहीं हो सका।");
    } finally {
      setSaving(false);
    }
  };

  const addWork = async () => {
    if (!workForm.karigarId) { setError("कारीगर चुनें"); return; }
    if (!workForm.description.trim()) { setError("काम का विवरण डालें"); return; }
    if (!workForm.issuedWeight || parseFloat(workForm.issuedWeight) <= 0) { setError("वजन डालें"); return; }
    setSaving(true);
    try {
      await fetch("/api/karigar/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workForm),
      });
      setShowWork(false);
      setWorkForm({ karigarId: "", description: "", metalType: "सोना", issuedWeight: "" });
      await loadAll();
    } catch {
      setError("सेव नहीं हो सका।");
    } finally {
      setSaving(false);
    }
  };

  const returnWork = async () => {
    if (!returnForm.returnedWeight || parseFloat(returnForm.returnedWeight) <= 0) {
      setError("वापस वजन डालें");
      return;
    }
    setSaving(true);
    try {
      const issued = parseFloat(selected.issuedWeight);
      const returned = parseFloat(returnForm.returnedWeight);
      const wastage = Math.max(0, issued - returned);
      await fetch("/api/karigar/work", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          returnedWeight: returned,
          wastageWeight: wastage,
          labourCharge: returnForm.labourCharge || null,
        }),
      });
      setReturnShow(false);
      setSelected(null);
      setReturnForm({ returnedWeight: "", labourCharge: "" });
      await loadAll();
    } catch {
      setError("सेव नहीं हो सका।");
    } finally {
      setSaving(false);
    }
  };

  const pending = works.filter((w) =>
    w.status === "pending" && (activeKarigar ? w.karigarId === activeKarigar : true)
  );
  const done = works.filter((w) =>
    w.status === "done" && (activeKarigar ? w.karigarId === activeKarigar : true)
  );

  // Total stats
  const totalIssuedPending = pending.reduce((s, w) => s + w.issuedWeight, 0);
  const totalWastage = works.filter((w) => w.status === "done")
    .reduce((s, w) => s + (w.wastageWeight || 0), 0);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
            <h1 className="text-lg font-black text-zinc-800">🔨 कारीगर</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowKarigar(true); setError(""); }}
              className="bg-zinc-800 text-white text-xs font-black px-3 py-2 rounded-xl"
            >
              + कारीगर
            </button>
            <button
              onClick={() => { setShowWork(true); setError(""); }}
              className="bg-[#AA7D6E] text-white text-xs font-black px-3 py-2 rounded-xl"
            >
              + काम
            </button>
          </div>
        </div>
      </header>

      {/* Add Karigar Modal */}
      {showKarigar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-800">नया कारीगर</h2>
              <button onClick={() => setShowKarigar(false)} className="text-zinc-400 text-2xl">×</button>
            </div>
            <input
              placeholder="कारीगर का नाम *"
              value={karigarForm.name}
              onChange={(e) => setKarigarForm({ ...karigarForm, name: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base focus:ring-[#AA7D6E]"
            />
            <input
              placeholder="मोबाइल नंबर"
              value={karigarForm.phone}
              onChange={(e) => setKarigarForm({ ...karigarForm, phone: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
              type="tel"
            />
            {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}
            <div className="flex gap-3">
              <button onClick={addKarigar} disabled={saving} className="flex-1 bg-[#AA7D6E] text-white font-black py-4 rounded-2xl disabled:opacity-50">
                {saving ? "⏳ सेव हो रहा है..." : "✅ सेव करें"}
              </button>
              <button onClick={() => setShowKarigar(false)} className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-4 rounded-2xl">रद्द करें</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Work Modal */}
      {showWork && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-800">काम सौंपें</h2>
              <button onClick={() => setShowWork(false)} className="text-zinc-400 text-2xl">×</button>
            </div>

            {karigars.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-zinc-400">पहले कारीगर जोड़ें</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {karigars.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => setWorkForm({ ...workForm, karigarId: k.id.toString() })}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                        workForm.karigarId === k.id.toString()
                          ? "bg-[#AA7D6E] text-white"
                          : "bg-zinc-50 text-zinc-600 border border-zinc-200"
                      }`}
                    >
                      🔨 {k.name}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="काम का विवरण * (जैसे: सोने का हार बनाना)"
                  value={workForm.description}
                  onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                  className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base h-20"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    {["सोना", "चाँदी"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setWorkForm({ ...workForm, metalType: m })}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm ${
                          workForm.metalType === m ? "bg-[#AA7D6E] text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-600"
                        }`}
                      >
                        {m === "सोना" ? "🥇" : "🥈"} {m}
                      </button>
                    ))}
                  </div>
                  <input
                    placeholder="दिया वजन (ग्राम) *"
                    value={workForm.issuedWeight}
                    onChange={(e) => setWorkForm({ ...workForm, issuedWeight: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
                    type="number"
                    step="0.01"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}
                <div className="flex gap-3">
                  <button onClick={addWork} disabled={saving} className="flex-1 bg-[#AA7D6E] text-white font-black py-4 rounded-2xl disabled:opacity-50">
                    {saving ? "⏳..." : "✅ सेव करें"}
                  </button>
                  <button onClick={() => setShowWork(false)} className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-4 rounded-2xl">रद्द करें</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Return Work Modal */}
      {returnShow && selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-800">काम वापस लें</h2>
              <button onClick={() => setReturnShow(false)} className="text-zinc-400 text-2xl">×</button>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4">
              <p className="font-bold text-zinc-700">{selected.karigarName}</p>
              <p className="text-zinc-500 text-sm mt-1">{selected.description}</p>
              <p className="text-sm mt-2">
                <span className="text-zinc-400">दिया था: </span>
                <span className="font-black text-zinc-800">{selected.issuedWeight}g {selected.metalType}</span>
              </p>
            </div>

            <input
              placeholder="वापस वजन (ग्राम) *"
              value={returnForm.returnedWeight}
              onChange={(e) => {
                setReturnForm({ ...returnForm, returnedWeight: e.target.value });
                setError("");
              }}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base focus:ring-[#AA7D6E]"
              type="number"
              step="0.01"
            />

            {/* Live wastage preview */}
            {returnForm.returnedWeight && parseFloat(returnForm.returnedWeight) > 0 && (
              <div className={`rounded-2xl p-4 ${
                selected.issuedWeight - parseFloat(returnForm.returnedWeight) > 0
                  ? "bg-red-50 border border-red-100"
                  : "bg-green-50 border border-green-100"
              }`}>
                <p className="text-xs font-bold text-zinc-500">घाटा (wastage)</p>
                <p className={`text-xl font-black ${
                  selected.issuedWeight - parseFloat(returnForm.returnedWeight) > 0
                    ? "text-red-500"
                    : "text-green-600"
                }`}>
                  {Math.max(0, (selected.issuedWeight - parseFloat(returnForm.returnedWeight)).toFixed(3))}g
                </p>
              </div>
            )}

            <input
              placeholder="मजदूरी ₹ (वैकल्पिक)"
              value={returnForm.labourCharge}
              onChange={(e) => setReturnForm({ ...returnForm, labourCharge: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
              type="number"
            />

            {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}
            <div className="flex gap-3">
              <button onClick={returnWork} disabled={saving} className="flex-1 bg-[#AA7D6E] text-white font-black py-4 rounded-2xl disabled:opacity-50">
                {saving ? "⏳..." : "✅ सेव करें"}
              </button>
              <button onClick={() => setReturnShow(false)} className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-4 rounded-2xl">रद्द करें</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <p className="text-xs text-orange-500 font-bold uppercase">बाहर गया सोना/चाँदी</p>
            <p className="text-xl font-black text-zinc-800 mt-1">{totalIssuedPending.toFixed(2)}g</p>
            <p className="text-xs text-zinc-400">चल रहे काम में</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-xs text-red-500 font-bold uppercase">कुल घाटा</p>
            <p className="text-xl font-black text-zinc-800 mt-1">{totalWastage.toFixed(3)}g</p>
            <p className="text-xs text-zinc-400">अब तक का wastage</p>
          </div>
        </div>

        {/* Karigar Filter Chips */}
        {karigars.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveKarigar(null)}
              className={`px-4 py-2 rounded-xl font-bold text-sm flex-shrink-0 transition ${
                !activeKarigar ? "bg-zinc-800 text-white" : "bg-white text-zinc-500 border border-zinc-200"
              }`}
            >
              सभी
            </button>
            {karigars.map((k) => (
              <button
                key={k.id}
                onClick={() => setActiveKarigar(activeKarigar === k.id ? null : k.id)}
                className={`px-4 py-2 rounded-xl font-bold text-sm flex-shrink-0 transition ${
                  activeKarigar === k.id ? "bg-[#AA7D6E] text-white" : "bg-white text-zinc-500 border border-zinc-200"
                }`}
              >
                🔨 {k.name}
              </button>
            ))}
          </div>
        )}

        {/* Pending works */}
        <h2 className="font-black text-zinc-700 text-sm uppercase tracking-widest">
          चल रहा काम ({pending.length})
        </h2>

        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-zinc-100 animate-pulse h-28" />
            ))}
          </div>
        )}

        {!loading && pending.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🔨</p>
            <p className="text-zinc-400">
              {activeKarigar ? "इस कारीगर का कोई काम नहीं" : "कोई काम नहीं चल रहा"}
            </p>
          </div>
        )}

        {!loading &&
          pending.map((w) => {
            const days = Math.ceil(
              (new Date() - new Date(w.issuedAt)) / (1000 * 60 * 60 * 24)
            );
            return (
              <div key={w.id} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-black text-zinc-800">{w.karigarName || "कारीगर"}</p>
                    <p className="text-zinc-500 text-sm mt-0.5">{w.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-black ${
                      w.metalType === "सोना" ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {w.metalType === "सोना" ? "🥇" : "🥈"} {w.metalType}
                    </span>
                    <p className="text-xs text-zinc-400 mt-1">{days} दिन से</p>
                  </div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-zinc-400">दिया गया</p>
                    <p className="font-black text-zinc-800">{w.issuedWeight}g</p>
                  </div>
                  <span className="text-zinc-300 text-xl">→</span>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">अपेक्षित वापसी</p>
                    <p className="font-black text-zinc-400">— g</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelected(w); setReturnShow(true); setError(""); }}
                  className="w-full bg-zinc-800 text-white text-sm font-black py-3 rounded-xl active:scale-95 transition"
                >
                  ✅ काम वापस लें
                </button>
              </div>
            );
          })}

        {/* Done works */}
        {!loading && done.length > 0 && (
          <>
            <h2 className="font-black text-zinc-400 text-sm uppercase tracking-widest mt-2">
              पूरा काम ({done.length})
            </h2>
            {done.map((w) => (
              <div key={w.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 opacity-75">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-zinc-600">{w.karigarName}</p>
                    <p className="text-zinc-400 text-sm">{w.description}</p>
                  </div>
                  {w.wastageWeight > 0 && (
                    <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full font-bold">
                      घाटा: {w.wastageWeight.toFixed(3)}g
                    </span>
                  )}
                </div>
                <div className="flex gap-3 mt-2 text-xs text-zinc-400">
                  <span>दिया: {w.issuedWeight}g</span>
                  <span>→</span>
                  <span>मिला: {w.returnedWeight}g</span>
                  {w.labourCharge && <span>| मजदूरी: ₹{w.labourCharge}</span>}
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">होम</span></Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🏦</span><span className="text-[10px] font-bold">गिरवी</span></Link>
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span></Link>
        <Link href="/dashboard/karigar" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]"><span className="text-xl">🔨</span><span className="text-[10px] font-bold">कारीगर</span></Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">⚙️</span><span className="text-[10px] font-bold">सेटिंग</span></Link>
      </nav>
    </div>
  );
}