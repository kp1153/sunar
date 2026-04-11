"use client"; // यहाँ क्लाइंट साइड की ज़रुरत पड़ेगी क्योंकि हम विंडो ओपन करेंगे

export default function BillingWidget({ customer, item, amount, date }) {
  const handleWhatsApp = () => {
    const message = `*स्वर्णशिल्पी ज्वेलर्स*%0A%0A*ग्राहक:* ${customer}%0A*सामान:* ${item}%0A*रकम:* ₹${amount}%0A*तारीख:* ${date}%0A%0Aधन्यवाद!`;
    window.open(`https://wa.me/91${customerPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-zinc-200">
      <h4 className="font-black text-zinc-800 mb-4 flex items-center gap-2">
        📄 रसीद जेनरेट करें
      </h4>
      
      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">ग्राहक:</span>
          <span className="font-bold">{customer || "---"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">आइटम:</span>
          <span className="font-bold">{item || "---"}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-zinc-800 font-bold">कुल देय:</span>
          <span className="text-[#AA7D6E] font-black text-lg">₹{amount || "0"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => window.print()}
          className="bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition text-sm"
        >
          🖨️ प्रिंट निकालें
        </button>
        <button 
          onClick={handleWhatsApp}
          className="bg-[#25D366] text-white font-bold py-3 rounded-xl hover:opacity-90 transition text-sm flex items-center justify-center gap-1"
        >
          📱 व्हाट्सएप
        </button>
      </div>
    </div>
  );
}