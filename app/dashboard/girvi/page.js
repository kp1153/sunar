"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function calcInterest(amount, rate, startDate) {
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)));
  // Calendar months — accurate calculation
  let months = 0;
  const d = new Date(start);
  while (d < today) {
    d.setMonth(d.getMonth() + 1);
    if (d <= today) months++;
    else {
      // आंशिक महीना
      const daysInMonth = new Date(d.getFullYear(), d.getMonth(), 0).getDate();
      const remaining = new Date(start);
      remaining.setMonth(remaining.getMonth() + months);
      const partialDays = Math.ceil((today - remaining) / (1000 * 60 * 60 * 24));
      months += partialDays / daysInMonth;
      break;
    }
  }
  const interest = Math.round((amount * rate * months) / 100);
  return { interest, total: amount + interest, days: diffDays };
}

export default function GirviPage() {
  const [rows, setRows] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active"); // active | closed
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    itemDetails: "",
    weightGrams: "",
    loanAmount: "",
    interestRate: "1.5",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/girvi").then((r) => r.json());
      if (Array.isArray(data)) setRows(data);
    } catch {
      setError("डेटा लोड नहीं हो सका।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.customerName.trim()) { setError("ग्राहक का नाम डालें"); return; }
    if (!form.itemDetails.trim()) { setError("गहने की जानकारी डालें"); return; }
    if (!form.loanAmount || parseInt(form.loanAmount) <= 0) { setError("सही रकम डालें"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/girvi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setShow(false);
      setForm({ customerName: "", customerPhone: "", itemDetails: "", weightGrams: "", loanAmount: "", interestRate: "1.5" });
      await load();
    } catch {
      setError("सेव नहीं हो सका। दोबारा कोशिश करें।");
    } finally {
      setSaving(false);
    }
  };

  const closeGirvi = async (id) => {
    try {
      await fetch("/api/girvi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } catch {
      setError("बदलाव नहीं हो सका।");
    }
  };

  const deleteGirvi = async (id) => {
    try {
      await fetch(`/api/girvi?id=${id}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch {
      setError("हटाया नहीं जा सका।");
    }
  };

  const filtered = rows
    .filter((r) => r.status === tab)
    .filter((r) =>
      search.trim()
        ? r.customerName.toLowerCase().includes(search.toLowerCase()) ||
          (r.customerPhone && r.customerPhone.includes(search))
        : true
    );

  const totalActiveLoan = rows
    .filter((r) => r.status === "active")
    .reduce((s, r) => s + r.loanAmount, 0);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-zinc-400 text-sm">← वापस</Link>
            <h1 className="text-lg font-black text-zinc-800">🏦 गिरवी खाता</h1>
          </div>
          <button
            onClick={() => { setShow(true); setError(""); }}
            className="bg-[#AA7D6E] text-white text-sm font-black px-4 py-2 rounded-xl"
          >
            + नई एंट्री
          </button>
        </div>
      </header>

      {/* New Entry Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-800">नई गिरवी एंट्री</h2>
              <button onClick={() => setShow(false)} className="text-zinc-400 text-2xl leading-none">×</button>
            </div>

            <input
              placeholder="ग्राहक का नाम *"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base focus:ring-[#AA7D6E]"
            />
            <input
              placeholder="मोबाइल नंबर (WhatsApp के लिए)"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
              type="tel"
            />
            <textarea
              placeholder="गहने का विवरण * (जैसे: सोने की अंगूठी, हार)"
              value={form.itemDetails}
              onChange={(e) => setForm({ ...form, itemDetails: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base h-20 focus:ring-[#AA7D6E]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="वजन (ग्राम)"
                value={form.weightGrams}
                onChange={(e) => setForm({ ...form, weightGrams: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
                type="number"
                step="0.1"
              />
              <input
                placeholder="दी गई रकम ₹ *"
                value={form.loanAmount}
                onChange={(e) => setForm({ ...form, loanAmount: e.target.value })}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base"
                type="number"
              />
            </div>
            <div className="bg-zinc-50 rounded-2xl p-4 ring-1 ring-zinc-200">
              <p className="text-xs text-zinc-400 font-bold mb-2">ब्याज दर — प्रति माह</p>
              <div className="flex gap-2 flex-wrap">
                {["1", "1.5", "2", "2.5", "3"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setForm({ ...form, interestRate: r })}
                    className={`px-4 py-2 rounded-xl text-sm font-black transition ${
                      form.interestRate === r
                        ? "bg-[#AA7D6E] text-white"
                        : "bg-white text-zinc-600 border border-zinc-200"
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-medium">⚠️ {error}</p>}

            <div className="flex gap-3">
              <button
                onClick={submit}
                disabled={saving}
                className="flex-1 bg-[#AA7D6E] text-white font-black py-4 rounded-2xl text-base disabled:opacity-50"
              >
                {saving ? "⏳ सेव हो रहा है..." : "✅ सेव करें"}
              </button>
              <button
                onClick={() => setShow(false)}
                className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-4 rounded-2xl"
              >
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 text-center">
            <p className="text-3xl">🗑️</p>
            <h3 className="font-black text-zinc-800 text-lg">एंट्री हटाएं?</h3>
            <p className="text-zinc-500 text-sm">यह एंट्री हमेशा के लिए हट जाएगी।</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteGirvi(deleteId)}
                className="flex-1 bg-red-500 text-white font-black py-3 rounded-2xl"
              >
                हाँ, हटाएं
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-zinc-200 text-zinc-600 font-bold py-3 rounded-2xl"
              >
                नहीं
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {/* Summary */}
        <div className="bg-[#AA7D6E]/10 border border-[#AA7D6E]/20 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-[#AA7D6E] font-bold uppercase">कुल सक्रिय गिरवी</p>
            <p className="text-2xl font-black text-zinc-800">
              {rows.filter((r) => r.status === "active").length} एंट्री
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400 font-medium">कुल रकम</p>
            <p className="text-xl font-black text-[#AA7D6E]">
              ₹{totalActiveLoan.toLocaleString("hi-IN")}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
          <input
            placeholder="नाम या नंबर से खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl ring-1 ring-zinc-200 outline-none text-base focus:ring-[#AA7D6E]"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${
              tab === "active" ? "bg-[#AA7D6E] text-white" : "bg-white text-zinc-500 border border-zinc-200"
            }`}
          >
            सक्रिय ({rows.filter((r) => r.status === "active").length})
          </button>
          <button
            onClick={() => setTab("closed")}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition ${
              tab === "closed" ? "bg-zinc-800 text-white" : "bg-white text-zinc-500 border border-zinc-200"
            }`}
          >
            बंद ({rows.filter((r) => r.status === "closed").length})
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-zinc-100 animate-pulse h-32" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{tab === "active" ? "🏦" : "✅"}</p>
            <p className="text-zinc-400 font-medium">
              {search ? "कोई नतीजा नहीं मिला" : tab === "active" ? "कोई सक्रिय गिरवी नहीं" : "कोई बंद गिरवी नहीं"}
            </p>
            {tab === "active" && !search && (
              <button
                onClick={() => setShow(true)}
                className="mt-4 bg-[#AA7D6E] text-white font-bold px-6 py-3 rounded-xl text-sm"
              >
                + पहली एंट्री डालें
              </button>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading &&
          filtered.map((row) => {
            const calc = calcInterest(row.loanAmount, row.interestRate, row.entryDate);
            const whatsappMsg = `नमस्ते ${row.customerName} जी 🙏%0A%0Aआपकी गिरवी का हिसाब:%0Aगहना: ${row.itemDetails}%0Aमूलधन: ₹${row.loanAmount}%0Aब्याज (${row.interestRate}%%/माह × ${calc.days} दिन): ₹${calc.interest}%0A*कुल देय: ₹${calc.total}*%0A%0Aकृपया जल्द आएं। धन्यवाद 🙏`;

            return (
              <div
                key={row.id}
                className={`bg-white rounded-2xl p-4 border shadow-sm space-y-3 ${
                  tab === "closed" ? "opacity-70 border-zinc-100" : "border-zinc-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-black text-zinc-800 text-base">{row.customerName}</p>
                    {row.customerPhone && (
                      <p className="text-xs text-zinc-400">{row.customerPhone}</p>
                    )}
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-black">
                    {calc.days} दिन
                  </span>
                </div>

                <p className="text-zinc-500 text-sm">{row.itemDetails}
                  {row.weightGrams ? <span className="ml-1 text-zinc-400">({row.weightGrams}g)</span> : null}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-zinc-50 rounded-xl p-2">
                    <p className="text-xs text-zinc-400">मूलधन</p>
                    <p className="font-black text-zinc-800 text-sm">₹{row.loanAmount.toLocaleString("hi-IN")}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2">
                    <p className="text-xs text-zinc-400">ब्याज</p>
                    <p className="font-black text-red-500 text-sm">₹{calc.interest.toLocaleString("hi-IN")}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2">
                    <p className="text-xs text-zinc-400">कुल</p>
                    <p className="font-black text-[#AA7D6E] text-sm">₹{calc.total.toLocaleString("hi-IN")}</p>
                  </div>
                </div>

                {tab === "active" && (
                  <div className="flex gap-2">
                    {row.customerPhone && (
                      <a
                        href={`https://wa.me/91${row.customerPhone}?text=${whatsappMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 text-white text-sm font-bold py-2.5 rounded-xl text-center"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => closeGirvi(row.id)}
                      className="flex-1 bg-zinc-800 text-white text-sm font-bold py-2.5 rounded-xl"
                    >
                      ✅ वापस मिली
                    </button>
                    <button
                      onClick={() => setDeleteId(row.id)}
                      className="bg-red-50 text-red-500 text-sm font-bold py-2.5 px-3 rounded-xl border border-red-100"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                {tab === "closed" && row.closeDate && (
                  <p className="text-xs text-zinc-400">
                    बंद हुई:{" "}
                    {new Date(row.closeDate).toLocaleDateString("hi-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            );
          })}
      </main>

  // File का सब कुछ same रखो — सिर्फ सबसे नीचे का <nav> block ये वाला बनाओ:

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">होम</span></Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]"><span className="text-xl">🏦</span><span className="text-[10px] font-black">गिरवी</span></Link>
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">🧾</span><span className="text-[10px] font-bold">बिल</span></Link>
        <Link href="/dashboard/urd" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">♻️</span><span className="text-[10px] font-bold">पुराना</span></Link>
        <Link href="/dashboard/stock" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"><span className="text-xl">📦</span><span className="text-[10px] font-bold">स्टॉक</span></Link>
      </nav>
    </div>
  );
}