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
    </div>
  );
});
