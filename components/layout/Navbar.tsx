"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageSquare, Upload, PlusCircle, Sparkles, Layers } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "แดชบอร์ด & AI Chat", href: "/", icon: MessageSquare, highlight: true },
    { label: "คลังเอกสาร DSD", href: "/documents", icon: BookOpen },
    { label: "อัปโหลด", href: "/documents/upload", icon: Upload },
    { label: "เขียนบทความ", href: "/documents/new", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Original Sleek Theme */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                VTEC Retail <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">KM</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                AI Knowledge Management
              </span>
            </div>
          </Link>

          {/* Workspace Pill */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>JFFPOS Retail (PTTRM)</span>
          </div>

          <div className="hidden xl:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            <span>DSD Signed (1,004 หน้า • BA-01 ถึง BA-09)</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-sm ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 ring-2 ring-blue-400/40"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
