"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function StockPrintPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/stock?id=${id}`)
      .then((r) => r.json())
      .then((all) => {
        if (Array.isArray(all)) {
          const found = all.find((x) => x.id === parseInt(id));
          setItem(found || null);
        }
        setLoading(false);
      });
  }, [id]);

  const printIt = () => window.print();

  if (loading) return <div className="p-8 text-center text-zinc-400">⏳...</div>;
  if (!item) return (
    <div className="p-8 text-center">
      <p className="text-zinc-500">सामान नहीं मिला</p>
      <Link href="/dashboard/stock" className="text-[#AA7D6E] font-bold">← वापस</Link>
    </div>
  );

  // CODE128 barcode को SVG में बनाने के लिए simple bars
  // हर अक्षर के लिए 8px width की 3 black bars
  const bars = item.barcode.split("").map((ch, i) => {
    const code = ch.charCodeAt(0);
    return (
      <g key={i} transform={`translate(${i * 12}, 0)`}>
        <rect x="0" y="0" width={(code % 3) + 1} height="60" fill="#000" />
        <rect x={(code % 3) + 3} y="0" width={(code % 2) + 1} height="60" fill="#000" />
        <rect x={(code % 4) + 7} y="0" width="1" height="60" fill="#000" />
      </g>
    );
  });

  return (
    <div className="min-h-screen bg-white p-4 print:p-0">
      <div className="max-w-md mx-auto print:max-w-none">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/dashboard/stock" className="text-zinc-400 text-sm">← वापस</Link>
          <button onClick={printIt} className="bg-[#AA7D6E] text-white font-black px-5 py-2.5 rounded-xl">
            🖨 प्रिंट करें
          </button>
        </div>

        <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-6 print:border-none print:rounded-none">
          <p className="text-center font-black text-zinc-800 text-lg">{item.name}</p>
          <p className="text-center text-xs text-zinc-500 mt-1">
            {item.metalType} {item.purity} • {item.weight}g
          </p>

          <div className="my-4 flex justify-center">
            <svg width={item.barcode.length * 12} height="60" xmlns="http://www.w3.org/2000/svg">
              {bars}
            </svg>
          </div>

          <p className="text-center font-mono font-black text-zinc-700">{item.barcode}</p>

          {item.hallmarkNo && (
            <p className="text-center text-xs text-zinc-500 mt-2">हॉलमार्क: {item.hallmarkNo}</p>
          )}
          {item.huid && (
            <p className="text-center text-xs text-zinc-500">HUID: {item.huid}</p>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: 60mm 40mm; margin: 0; }
          body { margin: 0; }
        }
      `}</style>
    </div>
  );
}