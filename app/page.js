import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Top Header / Contact */}
      <div className="bg-[#AA7D6E] py-2 px-4 text-center text-sm font-bold text-white flex flex-col sm:flex-row justify-center items-center gap-4">
        <span>✨ शुद्धता और विश्वास का डिजिटल संगम</span>
        <span className="hidden sm:inline">|</span>
        <a href="tel:+919996865069" className="hover:underline">📞 सहायता: 9996865069</a>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#AA7D6E] rounded-lg flex items-center justify-center text-white text-2xl shadow-lg">
              💎
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-zinc-800">
              स्वर्ण<span className="text-[#AA7D6E]">शिल्पी</span>
            </span>
          </div>
          <div className="hidden md:flex gap-8 font-medium text-zinc-600">
            <a href="#features" className="hover:text-[#AA7D6E] transition">खूबियाँ</a>
            <a href="#pricing" className="hover:text-[#AA7D6E] transition">कीमत</a>
            <a href="https://wa.me/919996865069" className="hover:text-[#AA7D6E] transition">सपोर्ट</a>
          </div>
          <button className="bg-zinc-900 text-white px-6 py-2 rounded-full font-bold hover:bg-zinc-800 transition shadow-md">
            लॉगिन करें
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 flex flex-col items-center text-center">
          <div className="inline-block bg-[#AA7D6E]/10 text-[#AA7D6E] px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-[#AA7D6E]/20">
            🥇 वाराणसी और सूरत के सर्राफा बाजार की पहली पसंद
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 mb-6 leading-[1.1]">
            गहनों का हिसाब अब <br />
            <span className="text-[#AA7D6E]">कागज पर नहीं, क्लाउड पर</span>
          </h1>
          <p className="max-w-2xl text-xl text-zinc-500 mb-10 leading-relaxed">
            टंच (Purity), मेकिंग चार्ज और गिरवी का ब्याज—सब कुछ एक जगह। <br />
            अपना समय बचाएं और व्यापार बढ़ाएं।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16">
            <button className="bg-[#AA7D6E] text-white text-xl font-bold px-10 py-5 rounded-2xl shadow-xl shadow-[#AA7D6E]/30 hover:scale-105 transition-transform">
              मुफ्त में शुरू करें
            </button>
            <button className="bg-white border-2 border-zinc-200 text-zinc-800 text-xl font-bold px-10 py-5 rounded-2xl hover:bg-zinc-50 transition">
              डेमो वीडियो देखें
            </button>
          </div>

          {/* Live Rate Strip - Static Placeholder for now */}
          <div className="w-full max-w-4xl bg-zinc-50 border border-zinc-100 rounded-3xl p-6 flex flex-wrap justify-around items-center gap-6 shadow-sm">
            <div className="text-left">
              <span className="text-zinc-400 text-sm font-bold block uppercase">आज का गोल्ड रेट (22K)</span>
              <span className="text-2xl font-black text-zinc-800">₹68,450 <small className="text-sm font-medium">/ 10g</small></span>
            </div>
            <div className="h-10 w-[1px] bg-zinc-200 hidden md:block"></div>
            <div className="text-left">
              <span className="text-zinc-400 text-sm font-bold block uppercase">आज का चांदी रेट (999)</span>
              <span className="text-2xl font-black text-zinc-800">₹82,100 <small className="text-sm font-medium">/ kg</small></span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-20 border-t border-zinc-100">
          <h2 className="text-3xl font-black text-center mb-12">खास सुनारों के लिए फीचर्स</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">⚖️</div>
              <h3 className="text-xl font-bold mb-3">टंच और मेकिंग का गणित</h3>
              <p className="text-zinc-500">वजन डालिए, टंच चुनिए और मेकिंग चार्ज जोड़िये। सॉफ्टवेयर नेट वेट और फाइनल कीमत खुद निकाल लेगा।</p>
            </div>
            <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">🔄</div>
              <h3 className="text-xl font-bold mb-3">पुराना सोना (Exchange)</h3>
              <p className="text-zinc-500">ग्राहक का पुराना सोना काटकर नए गहने का बिल बनाना अब और भी आसान।</p>
            </div>
            <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">🏦</div>
              <h3 className="text-xl font-bold mb-3">स्मार्ट गिरवी कैलकुलेटर</h3>
              <p className="text-zinc-500">ब्याज की दर सेट करें और गिरवी छूड़ाते समय एक क्लिक में पूरा हिसाब देखें।</p>
            </div>
          </div>
        </section>

        {/* Local Advantage Section */}
        <section className="py-20 bg-[#AA7D6E] rounded-[3rem] my-20 px-10 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-6">बनारस और सूरत के छोटे कारीगरों के लिए विशेष</h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
            हमने इस सॉफ्टवेयर को आपके फीडबैक पर बनाया है। इसमें वह सब कुछ है जो एक लोकल सर्राफा दुकान को चाहिए।
          </p>
          <div className="flex flex-wrap justify-center gap-10 font-bold text-lg">
            <span>✅ ऑफलाइन-फर्स्ट</span>
            <span>✅ सुरक्षित डेटा</span>
            <span>✅ व्हाट्सएप बिल</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-500 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#AA7D6E] rounded flex items-center justify-center text-white text-xl">💎</div>
              <span className="font-bold text-xl text-white">स्वर्णशिल्पी</span>
            </div>
            <p className="max-w-xs">वाराणसी और सूरत की विरासत को डिजिटल मजबूती देने के लिए प्रतिबद्ध।</p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-bold text-zinc-300 mb-2">© 2026 निशांत सॉफ्टवेयर सॉल्यूशन्स</p>
            <p className="text-sm italic">सप्रेम निर्मित: कामता प्रसाद (वेब स्पेशलिस्ट)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}