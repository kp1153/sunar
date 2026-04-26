"use client";
import { useEffect, useState } from "react";

export default function ExpiredPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function getEmail() {
      try {
        const res = await fetch("/api/auth/session-check");
        const data = await res.json();
        if (data?.email) setEmail(data.email);
      } catch {}
    }
    getEmail();
  }, []);

  const renewUrl = `https://nishantsoftwares.in/payment?software=sunar&email=${encodeURIComponent(email)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center space-y-5">
        <div className="text-5xl">⏰</div>
        <h1 className="text-2xl font-extrabold text-gray-800">Subscription Expired</h1>
        <p className="text-gray-500 text-sm">
          Your Sunar Pro trial or subscription has ended. Renew now to continue.
        </p>
        {email && (
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            {email}
          </p>
        )}
        <a
          href={renewUrl}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-base transition"
        >
          🔄 Renew Now
        </a>
        <a href="/api/auth/logout" className="block text-sm text-gray-400 hover:text-gray-600">
          Logout
        </a>
      </div>
    </div>
  );
}