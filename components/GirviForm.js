import { addGirvi } from "@/app/actions/girvi";

export default function GirviForm() {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-xl max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
          🏦
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-800">नई गिरवी एंट्री</h2>
          <p className="text-zinc-500 text-sm font-medium">ग्राहक और गहने का विवरण भरें</p>
        </div>
      </div>

      <form action={addGirvi} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">ग्राहक का नाम</label>
          <input 
            name="customerName"
            type="text" 
            placeholder="जैसे: राम प्रसाद"
            className="w-full p-4 bg-zinc-50 rounded-2xl border-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-[#AA7D6E] outline-none transition-all"
            required 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">गहने का विवरण</label>
          <textarea 
            name="itemDetails"
            placeholder="जैसे: 2 सोने की अंगूठी, 10 ग्राम"
            className="w-full p-4 bg-zinc-50 rounded-2xl border-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-[#AA7D6E] outline-none transition-all h-24"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">दिया गया पैसा (₹)</label>
            <input 
              name="loanAmount"
              type="number" 
              placeholder="50000"
              className="w-full p-4 bg-zinc-50 rounded-2xl border-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-[#AA7D6E] outline-none transition-all"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">ब्याज दर (% प्रति माह)</label>
            <input 
              name="interestRate"
              type="number" 
              step="0.1"
              placeholder="1.5"
              className="w-full p-4 bg-zinc-50 rounded-2xl border-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-[#AA7D6E] outline-none transition-all"
              required 
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-[#AA7D6E] text-white text-lg font-bold py-5 rounded-2xl shadow-lg shadow-[#AA7D6E]/20 hover:scale-[1.02] active:scale-95 transition-all">
          एंट्री सुरक्षित करें
        </button>
      </form>
    </div>
  );
}