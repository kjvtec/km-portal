"use client";

import React, { memo } from "react";
import Link from "next/link";
import {
  Layers,
  ExternalLink,
  ChevronRight,
  Database,
  ShieldCheck,
  Cpu,
  BookOpen,
  Cloud,
  FileText,
} from "lucide-react";
import { BusinessModule } from "./types";

interface BusinessModulesGridProps {
  modules: BusinessModule[];
  brCounts: Record<string, number>;
  onSelectBA: (code: string) => void;
}

export const BusinessModulesGrid = memo(function BusinessModulesGrid({
  modules,
  brCounts,
  onSelectBA,
}: BusinessModulesGridProps) {
  return (
    <div className="pt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            <span>โครงสร้างระบบงาน 9 หมวดธุรกิจหลัก (DSD Business Areas: BA-01 ถึง BA-09)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            คลิกที่การ์ดหมวดเพื่อเปิดดู <strong>ข้อกำหนด BR ข้อย่อยทั้งหมด</strong> ในหมวดนั้นพร้อมเลขหน้าอ้างอิง
          </p>
        </div>

        <Link
          href="/documents"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
        >
          <span>ดูโครงสร้างและเอกสารทั้งหมด</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const brCount = brCounts[m.code] || 0;
          return (
            <button
              key={m.code}
              onClick={() => onSelectBA(m.code)}
              className="text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-white group-hover:bg-blue-600 transition-colors">
                    {m.code}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {m.pages}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                  {m.name}
                </h3>
                <p className="text-xs text-blue-600/80 font-medium mb-1.5">
                  {m.en}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {m.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span className="flex items-center gap-1.5">
                  <span>ดูข้อกำหนด BR ทั้งหมด</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    {brCount} ข้อ
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* AWS Cloud Architecture Banner Card */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold">
                <Cloud className="h-3.5 w-3.5 text-slate-950" />
                <span>AWS Cloud Infrastructure</span>
              </span>
              <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                DEV Environment v1.5
              </span>
              <span className="text-xs text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-md">
                ap-southeast-7 (Bangkok)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              สถาปัตยกรรมโครงสร้างพื้นฐานคลาวด์ AWS (DailiTech Resource Summary)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ครอบคลุมสถาปัตยกรรม Multi-Account (Workload 312728688861 + Network 607063196689), EKS v1.35, Aurora PostgreSQL 17.5, Redis 7.1, CloudFront CDN, AWS WAF, และการเชื่อมต่อ OpenVPN Gateway
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/documents/aws"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-orange-400 transition-all shadow-md"
            >
              <BookOpen className="h-4 w-4" />
              <span>เปิดอ่านสรุปสถาปัตยกรรม</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href="/docs/PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span>เปิดดูไฟล์ PDF</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});
