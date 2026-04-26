"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    address: "",
    gstin: "",
  });
  const [userInfo, setUserInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.shopName !== undefined) {
          setForm({
            shopName: data.shopName || "",
            ownerName: data.ownerName || "",
            phone: data.phone || "",
            address: data.address || "",
            gstin: data.gstin || "",
          });
        }
      });
    fetch("/api/auth/session-check")
      .then((r) => r.json())
      .then((data) => {
        if (data?.email) setUserInfo(data);
      });
  }, []);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("सेव नहीं हो सका। दोबारा कोशिश करें।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 text-sm">
            ← वापस
          </Link>
          <h1 className="text-lg font-black text-zinc-800">⚙️ सेटिंग</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Account Info */}
        {userInfo && (
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <h2 className="font-black text-zinc-800 mb-3">खाता जानकारी</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#AA7D6E]/10 rounded-xl flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <p className="font-bold text-zinc-800">
                  {userInfo.name || "—"}
                </p>
                <p className="text-zinc-400 text-sm">{userInfo.email}</p>
                <p className="text-xs mt-0.5">
                  <span
                    className={`font-black ${userInfo.status === "active" ? "text-green-500" : "text-amber-500"}`}
                  >
                    {userInfo.status === "active" ? "✅ सक्रिय" : "⏳ परीक्षण"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shop Details */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4">
          <div>
            <h2 className="font-black text-zinc-800">दुकान की जानकारी</h2>
            <p className="text-zinc-400 text-xs mt-1">
              यह जानकारी बिल पर छपेगी
            </p>
          </div>

          {[
            {
              key: "shopName",
              label: "दुकान का नाम",
              placeholder: "जैसे: श्री राम ज्वेलर्स",
            },
            {
              key: "ownerName",
              label: "मालिक का नाम",
              placeholder: "जैसे: रामप्रसाद जी",
            },
            {
              key: "phone",
              label: "मोबाइल नंबर",
              placeholder: "जैसे: 9876543210",
              type: "tel",
            },
            {
              key: "gstin",
              label: "GSTIN (वैकल्पिक)",
              placeholder: "जैसे: 09AAAAA0000A1Z5",
            },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                {label}
              </label>
              <input
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                type={type || "text"}
                className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base focus:ring-[#AA7D6E]"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
              पता
            </label>
            <textarea
              placeholder="दुकान का पूरा पता"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-4 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200 outline-none text-base h-20 focus:ring-[#AA7D6E]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}

          <button
            onClick={submit}
            disabled={saving}
            className="w-full bg-[#AA7D6E] text-white font-black py-4 rounded-2xl text-base disabled:opacity-50 active:scale-95 transition"
          >
            {saving
              ? "⏳ सेव हो रहा है..."
              : saved
                ? "✅ सेव हो गया!"
                : "सेटिंग सेव करें"}
          </button>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <h2 className="font-black text-zinc-800 mb-3">खाता</h2>
          <a
            href="/api/auth/logout"
            className="block w-full bg-red-50 text-red-600 font-black py-4 rounded-2xl text-base text-center border border-red-100 active:scale-95 transition"
          >
            🚪 लॉगआउट करें
          </a>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-zinc-300 pb-4">
          स्वर्णशिल्पी v1.0 • Nishant Softwares
        </p>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">होम</span>
        </Link>
        <Link
          href="/dashboard/girvi"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"
        >
          <span className="text-xl">🏦</span>
          <span className="text-[10px] font-bold">गिरवी</span>
        </Link>
        <Link
          href="/dashboard/bill"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"
        >
          <span className="text-xl">🧾</span>
          <span className="text-[10px] font-bold">बिल</span>
        </Link>
        <Link
          href="/dashboard/urd"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"
        >
          <span className="text-xl">♻️</span>
          <span className="text-[10px] font-bold">पुराना</span>
        </Link>
        <Link
          href="/dashboard/stock"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400"
        >
          <span className="text-xl">📦</span>
          <span className="text-[10px] font-bold">स्टॉक</span>
        </Link>
      </nav>
    </div>
  );
}
