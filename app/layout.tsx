import type { Metadata } from "next";
import { Suspense } from "react";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VTEC Retail KM - AI Knowledge Management Portal (PTTRM)",
  description:
    "AI-powered Knowledge Management & RAG Assistant for VTEC Retail POS and Jiffy Convenience Store (PTTRM) DSD Specification V1.0",
  icons: {
    icon: "/images/vtec-icon.png",
    shortcut: "/images/vtec-icon.png",
    apple: "/images/vtec-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${notoSansThai.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        
        {/* Sleek Theme Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-normal text-slate-600">
              © 2026 VTEC Retail Solution • Jiffy Convenience Store (PTTRM) Knowledge Base
            </p>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Next.js 16 • Supabase pgvector • Groq AI Qwen 3.8 27B</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
