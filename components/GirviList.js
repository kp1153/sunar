import { db } from "@/db";
import { girvi } from "@/db/schema";
import { desc } from "drizzle-orm";

// यह फंक्शन डेटा को सर्वर पर कैलकुलेट करेगा
function calculateInterest(amount, rate, startDate) {
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.ceil(Math.abs(today - start) / (1000 * 60 * 60 * 24));
  const months = diffDays / 30;
  const interest = Math.round((amount * rate * months) / 100);
  return { interest, total: amount + interest, days: diffDays };
}

export default async function GirviList() {
  // डेटाबेस से रिकॉर्ड्स सर्वर पर ही खींच रहे हैं
  const allGirvi = await db.select().from(girvi).orderBy(desc(girvi.entryDate));

  return (
    <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-50 text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
          <tr>
            <th className="px-6 py-4">ग्राहक/सामान</th>
            <th className="px-6 py-4">मूलधन</th>
            <th className="px-6 py-4">ब्याज</th>
            <th className="px-6 py-4">कुल</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {allGirvi.map((item) => {
            const calc = calculateInterest(item.loanAmount, item.interestRate, item.entryDate);
            return (
              <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-zinc-800">{item.customerName}</div>
                  <div className="text-xs text-zinc-400">{item.itemDetails}</div>
                </td>
                <td className="px-6 py-4 text-zinc-600">₹{item.loanAmount}</td>
                <td className="px-6 py-4 text-red-500 font-bold">
                  +₹{calc.interest} <span className="text-[10px] text-zinc-400">({calc.days} दिन)</span>
                </td>
                <td className="px-6 py-4 font-black text-[#AA7D6E]">₹{calc.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {allGirvi.length === 0 && (
        <div className="p-10 text-center text-zinc-400 italic">अभी कोई रिकॉर्ड नहीं है।</div>
      )}
    </div>
  );
}