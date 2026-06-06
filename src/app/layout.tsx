import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Voting ITH - OgiTech",
  description: "Portal Pemilihan Elektronik Institut Teknologi Bacharuddin Jusuf Habibie",
};

import ClientGuardian from "@/components/ClientGuardian";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col select-none">
        <Providers>
          <ClientGuardian />
          {children}
          {/* OgiTech Watermark */}
          <a 
            href="https://ogitech.my.id" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:shadow-lg border border-slate-200 transition-all duration-300 hover:-translate-y-1 group"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
              Built By <span className="text-slate-800 group-hover:text-blue-700">OgiTech</span>
            </span>
            <img src="/logo_ogitech_clean.png" alt="OgiTech Logo" className="h-5 w-auto object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all" />
          </a>
        </Providers>
      </body>
    </html>
  );
}
