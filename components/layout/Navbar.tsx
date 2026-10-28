"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageSquare, Upload, PlusCircle, Menu, X, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "แดชบอร์ด & AI Chat", shortLabel: "AI Chat", href: "/", icon: MessageSquare, highlight: true },
    { label: "คลังเอกสาร DSD", shortLabel: "คลัง DSD", href: "/documents", icon: BookOpen },
    { label: "อัปโหลดเอกสาร", shortLabel: "อัปโหลด", href: "/documents/upload", icon: Upload },
    { label: "เขียนบทความ", shortLabel: "เขียนใหม่", href: "/documents/new", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo - Official VTEC Theme */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs border border-slate-200 transition-transform group-hover:scale-105">
              <img
                src="/images/vtec-navicon.png"
                alt="VTEC Navicon"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>VTEC Retail</span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-extrabold">KM</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                AI Knowledge Management
              </span>
            </div>
          </Link>

          {/* Workspace Pill - Desktop only */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>JFFPOS Retail (PTTRM)</span>
          </div>
        </div>

        {/* Desktop Navigation Links (>= md) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all shadow-sm ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 ring-2 ring-blue-400/40"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation Controls (< md) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <Link
            href="/"
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-all ${
              pathname === "/"
                ? "bg-blue-600 text-white ring-2 ring-blue-400/40"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            <span>AI Chat</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200/80"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      หลัก
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            JIFFY Retail POS (PTTRM) • DSD 1,004 หน้า & AWS DEV
          </div>
        </div>
      )}
    </header>
  );
}
