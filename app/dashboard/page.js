import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/");

  if (session.status !== "active") {
    const expiry = session.expiryDate ? new Date(session.expiryDate) : null;
    if (!expiry || new Date() > expiry) {
      redirect("https://nishantsoftwares.in/sunar?email=" + encodeURIComponent(session.email));
    }
  }

  const daysLeft = session.expiryDate
    ? Math.ceil((new Date(session.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#AA7D6E] rounded-xl flex items-center justify-center text-white text-lg">💎</div>
            <div>
              <h1 className="text-lg font-black text-zinc-800 leading-tight">स्वर्ण<span className="text-[#AA7D6E]">शिल्पी</span></h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">डिजिटल मुनीम</p>
            </div>
          </div>
          <a href="/api/auth/logout" className="text-xs text-zinc-400 border border-zinc-200 px-3 py-1.5 rounded-lg">लॉगआउट</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {session.status === "trial" && daysLeft <= 3 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-600 font-bold text-sm">⚠️ {daysLeft} दिन में परीक्षण समाप्त होगा।</p>
            <a href={"https://nishantsoftwares.in/sunar?email=" + encodeURIComponent(session.email)}
              className="inline-block mt-1 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              अभी खरीदें
            </a>
          </div>
        )}

        {session.status === "trial" && daysLeft > 3 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="text-amber-600 font-semibold text-sm">⏳ {daysLeft} दिन का मुफ्त परीक्षण चल रहा है।</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <p className="text-zinc-500 text-sm">नमस्ते,</p>
          <p className="text-xl font-black text-zinc-800">{session.name} 🙏</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/girvi" className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center gap-2 hover:border-[#AA7D6E] transition">
            <span className="text-3xl">🏦</span>
            <span className="font-bold text-zinc-800 text-sm">गिरवी</span>
            <span className="text-xs text-zinc-600">बंधक का हिसाब</span>
          </Link>
          <Link href="/dashboard/karigar" className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center gap-2 hover:border-[#AA7D6E] transition">
            <span className="text-3xl">🔨</span>
            <span className="font-bold text-zinc-800 text-sm">कारीगर</span>
            <span className="text-xs text-zinc-600">काम का हिसाब</span>
          </Link>
          <Link href="/dashboard/bhav" className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center gap-2 hover:border-[#AA7D6E] transition">
            <span className="text-3xl">📈</span>
            <span className="font-bold text-zinc-800 text-sm">भाव</span>
            <span className="text-xs text-zinc-600">सोना-चाँदी रेट</span>
          </Link>
          <Link href="/dashboard/bill" className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center gap-2 hover:border-[#AA7D6E] transition">
            <span className="text-3xl">🧾</span>
            <span className="font-bold text-zinc-800 text-sm">बिल</span>
            <span className="text-xs text-zinc-600">बिल बनाओ</span>
          </Link>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">होम</span>
        </Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🏦</span>
          <span className="text-[10px] font-bold">गिरवी</span>
        </Link>
        <Link href="/dashboard/karigar" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🔨</span>
          <span className="text-[10px] font-bold">कारीगर</span>
        </Link>
        <Link href="/dashboard/bhav" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">📈</span>
          <span className="text-[10px] font-bold">भाव</span>
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-bold">सेटिंग</span>
        </Link>
      </nav>
    </div>
  );
}