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
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          {/* OgiTech Watermark */}
          <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50 transition-all duration-300">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Built By</span>
            <img src="/logo_ogitech_clean.png" alt="OgiTech" className="h-4 w-auto object-contain drop-shadow-sm opacity-90" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
