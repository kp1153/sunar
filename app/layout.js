import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "स्वर्णशिल्पी | ज्वेलरी बिलिंग सॉफ्टवेयर",
  description: "सुनारों के लिए सबसे सरल बिलिंग और गिरवी मैनेजमेंट सॉफ्टवेयर",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="hi"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full bg-white antialiased text-zinc-900">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}