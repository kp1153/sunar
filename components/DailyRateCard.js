import { updateRate } from "@/app/actions/rates";

export default function DailyRateCard() {
  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm max-w-sm">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        📈 आज का भाव सेट करें
      </h3>
      
      <form action={updateRate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-500 mb-1">धातु (Metal)</label>
          <select name="metal" className="w-full p-3 bg-zinc-50 rounded-xl border-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-[#AA7D6E] outline-none">
            <option value="Gold">सोना (Gold)</option>
            <option value="Silver">चांदी (Silver)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-500 mb-1">भाव (प्रति 10 ग्राम)</label>
          <input 
            type="number" 
            name="price" 
            placeholder="जैसे: 72000"
            className="w-full p-3 bg-zinc-50 rounded-xl border-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-[#AA7D6E] outline-none"
            required
          />
        </div>

        <button type="submit" className="w-full bg-[#AA7D6E] text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
          भाव अपडेट करें
        </button>
      </form>
    </div>
  );
}