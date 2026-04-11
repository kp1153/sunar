import React, { Suspense } from "react";
import GirviForm from "@/components/GirviForm";
import GirviList from "@/components/GirviList";
import DailyRateCard from "@/components/DailyRateCard";

// यह पेज Server Component है (By Default)
// इसका सारा डेटा फेचिंग सर्वर पर ही खत्म हो जाता है
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans text-zinc-900 pb-20">
      
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#AA7D6E] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              💎
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-800 tracking-tight">
                स्वर्ण<span className="text-[#AA7D6E]">शिल्पी</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                डिजिटल मुनीम | कामता प्रसाद
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-zinc-100 px-5 py-2 rounded-2xl font-bold text-zinc-600 text-sm border border-zinc-200">
              📅 {new Intl.DateTimeFormat('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Main Grid: Rate and Form */}
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left: Controls (Daily Rate & Alerts) */}
          <div className="lg:col-span-4 space-y-8">
            <DailyRateCard />
            
            <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-amber-200">
              <h4 className="font-black text-amber-700 mb-3 flex items-center gap-2">
                ⚠️ रिमाइंडर्स
              </h4>
              <ul className="text-sm text-zinc-500 space-y-3 font-medium">
                <li className="flex gap-2">🔹 गिरवी रसीद पर साइन ज़रूर लें।</li>
                <li className="flex gap-2">🔹 पुराना सोना लेते समय टंच चेक करें।</li>
                <li className="flex gap-2">🔹 बैकअप हर रात ऑटोमैटिक होता है।</li>
              </ul>
            </div>
          </div>

          {/* Right: Girvi Entry Form */}
          <div className="lg:col-span-8">
            <GirviForm />
            
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-3">
                  <span className="w-3 h-8 bg-[#AA7D6E] rounded-full"></span>
                  सक्रिय गिरवी खाता
                </h2>
                <button className="text-sm font-bold text-[#AA7D6E] hover:underline">
                  सभी रिकॉर्ड देखें →
                </button>
              </div>

              {/* Suspense ensures the page doesn't freeze while fetching from Turso */}
              <Suspense fallback={
                <div className="w-full p-20 bg-white rounded-[2rem] border border-zinc-100 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#AA7D6E] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-zinc-400">डेटाबेस से रिकॉर्ड सुरक्षित लोड हो रहे हैं...</p>
                </div>
              }>
                <GirviList />
              </Suspense>
            </div>
          </div>

        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-zinc-100 px-6 py-3 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        Database Status: <span className="text-green-500">Connected to Turso (SQLite)</span> | Powered by Nishant Software Solutions
      </footer>
    </div>
  );
}