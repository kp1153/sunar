import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { girvi, bills, karigarWork } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/");

  if (session.status !== "active") {
    const expiry = session.expiryDate ? new Date(session.expiryDate) : null;
    if (!expiry || new Date() > expiry) redirect("/expired");
  }

  const daysLeft = session.expiryDate
    ? Math.ceil(
        (new Date(session.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // Summary data fetch
  const activeGirvi = await db
    .select()
    .from(girvi)
    .where(and(eq(girvi.userId, session.userId), eq(girvi.status, "active")));

  const pendingWork = await db
    .select()
    .from(karigarWork)
    .where(
      and(
        eq(karigarWork.userId, session.userId),
        eq(karigarWork.status, "pending")
      )
    );

  // कुल गिरवी रकम
  const totalLoan = activeGirvi.reduce((sum, g) => sum + g.loanAmount, 0);

  // आज के बिल
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const allBills = await db
    .select()
    .from(bills)
    .where(eq(bills.userId, session.userId));
  const todayBills = allBills.filter(
    (b) => new Date(b.createdAt) >= todayStart
  );
  const todaySale = todayBills.reduce((sum, b) => sum + b.totalAmount, 0);

  const paymentUrl = `https://nishantsoftwares.in/payment?software=sunar&email=${encodeURIComponent(session.email)}`;

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#AA7D6E] rounded-xl flex items-center justify-center text-white text-lg">
              💎
            </div>
            <div>
              <h1 className="text-lg font-black text-zinc-800 leading-tight">
                स्वर्ण<span className="text-[#AA7D6E]">शिल्पी</span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                डिजिटल मुनीम
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/settings"
            className="text-xs text-zinc-400 border border-zinc-200 px-3 py-1.5 rounded-lg"
          >
            ⚙️ सेटिंग
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Trial Banner */}
        {session.status === "trial" && daysLeft <= 3 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-600 font-black text-sm">
              ⚠️ सिर्फ {daysLeft} दिन बचे हैं!
            </p>
            <p className="text-red-500 text-xs mt-0.5">
              अभी नवीनीकरण करें — डेटा सुरक्षित रहेगा
            </p>
            <a
              href={paymentUrl}
              className="inline-block mt-2 bg-red-500 text-white text-xs font-black px-4 py-2 rounded-xl"
            >
              अभी खरीदें — ₹4,999
            </a>
          </div>
        )}
        {session.status === "trial" && daysLeft > 3 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between">
            <p className="text-amber-700 font-semibold text-sm">
              ⏳ {daysLeft} दिन का मुफ्त परीक्षण
            </p>
            <a
              href={paymentUrl}
              className="text-xs text-amber-600 font-bold underline"
            >
              खरीदें
            </a>
          </div>
        )}

        {/* Greeting */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 bg-[#AA7D6E]/10 rounded-xl flex items-center justify-center text-2xl">
            🙏
          </div>
          <div>
            <p className="text-zinc-400 text-xs">नमस्ते</p>
            <p className="text-lg font-black text-zinc-800">{session.name}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
            <p className="text-xs text-zinc-400 font-medium">सक्रिय गिरवी</p>
            <p className="text-2xl font-black text-zinc-800 mt-1">
              {activeGirvi.length}
            </p>
            <p className="text-xs text-[#AA7D6E] font-bold mt-1">
              ₹{totalLoan.toLocaleString("hi-IN")} लगे हुए
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
            <p className="text-xs text-zinc-400 font-medium">आज की बिक्री</p>
            <p className="text-2xl font-black text-zinc-800 mt-1">
              {todayBills.length} बिल
            </p>
            <p className="text-xs text-green-600 font-bold mt-1">
              ₹{Math.round(todaySale).toLocaleString("hi-IN")}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
            <p className="text-xs text-zinc-400 font-medium">कारीगर काम</p>
            <p className="text-2xl font-black text-zinc-800 mt-1">
              {pendingWork.length}
            </p>
            <p className="text-xs text-orange-500 font-bold mt-1">
              काम चल रहा है
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
            <p className="text-xs text-zinc-400 font-medium">कुल बिल</p>
            <p className="text-2xl font-black text-zinc-800 mt-1">
              {allBills.length}
            </p>
            <p className="text-xs text-zinc-400 font-bold mt-1">
              अब तक बने
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/girvi"
            className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center gap-2 hover:border-[#AA7D6E] active:scale-95 transition"
          >
            <span className="text-3xl">🏦</span>
            <span className="font-black text-zinc-800 text-sm">गिरवी</span>
            <span className="text-xs text-zinc-400 text-center">
              बंधक का हिसाब
            </span>
          </Link>
          <Link
            href="/dashboard/karigar"
            className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center gap-2 hover:border-[#AA7D6E] active:scale-95 transition"
          >
            <span className="text-3xl">🔨</span>
            <span className="font-black text-zinc-800 text-sm">कारीगर</span>
            <span className="text-xs text-zinc-400 text-center">
              काम का हिसाब
            </span>
          </Link>
          <Link
            href="/dashboard/bill"
            className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center gap-2 hover:border-[#AA7D6E] active:scale-95 transition"
          >
            <span className="text-3xl">🧾</span>
            <span className="font-black text-zinc-800 text-sm">बिल बनाओ</span>
            <span className="text-xs text-zinc-400 text-center">
              नया बिल
            </span>
          </Link>
          <Link
            href="/dashboard/bhav"
            className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center gap-2 hover:border-[#AA7D6E] active:scale-95 transition"
          >
            <span className="text-3xl">📈</span>
            <span className="font-black text-zinc-800 text-sm">भाव</span>
            <span className="text-xs text-zinc-400 text-center">
              आज का रेट
            </span>
          </Link>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 flex justify-around items-center py-2 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#AA7D6E]">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-black">होम</span>
        </Link>
        <Link href="/dashboard/girvi" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🏦</span>
          <span className="text-[10px] font-bold">गिरवी</span>
        </Link>
        <Link href="/dashboard/bill" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🧾</span>
          <span className="text-[10px] font-bold">बिल</span>
        </Link>
        <Link href="/dashboard/karigar" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">🔨</span>
          <span className="text-[10px] font-bold">कारीगर</span>
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400">
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-bold">सेटिंग</span>
        </Link>
      </nav>
    </div>
  );
}