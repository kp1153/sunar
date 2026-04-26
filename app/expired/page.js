"use client";
import { useEffect, useState } from "react";

export default function ExpiredPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/session-check")
      .then((r) => r.json())
      .then((data) => { if (data?.email) setEmail(data.email); })
      .catch(() => {});
  }, []);

  const renewUrl = `https://nishantsoftwares.in/payment?software=sunar&email=${encodeURIComponent(email)}`;

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center space-y-5 border border-[#AA7D6E]/20">
        <div className="w-20 h-20 bg-[#AA7D6E]/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">⏰</span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-zinc-800">
            समय समाप्त हो गया
          </h1>
          <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
            आपका परीक्षण या सदस्यता खत्म हो गई है।{" "}
            <span className="font-bold text-zinc-700">
              डेटा सुरक्षित है
            </span>{" "}
            — बस नवीनीकरण करें और सब वापस मिल जाएगा।
          </p>
        </div>

        {email && (
          <div className="bg-zinc-50 rounded-xl px-4 py-2 border border-zinc-100">
            <p className="text-xs text-zinc-400 font-medium">{email}</p>
          </div>
        )}

        <div className="space-y-3">
          <a
            href={renewUrl}
            className="block w-full bg-[#AA7D6E] hover:bg-[#9A6D5E] text-white font-black py-4 rounded-2xl text-base transition shadow-lg shadow-[#AA7D6E]/30"
          >
            🔄 अभी नवीनीकरण करें — ₹2,500
          </a>

          <a
            href="https://wa.me/919996865069"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl text-sm transition"
          >
            💬 WhatsApp पर बात करें
          </a>
        </div>

        <div className="pt-2 border-t border-zinc-100">
          <p className="text-xs text-zinc-400 mb-2">
            नवीनीकरण के बाद अपने आप चालू हो जाएगा
          </p>
          <a
            href="/api/auth/logout"
            className="text-xs text-zinc-400 hover:text-zinc-600 underline"
          >
            लॉगआउट करें
          </a>
        </div>
      </div>
    </div>
  );
}