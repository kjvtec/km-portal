"use client";

import React, { memo } from "react";
import Link from "next/link";
import { BookOpen, Upload, Database, RefreshCw, CheckCircle2 } from "lucide-react";

interface QuickActionsBarProps {
  seeding: boolean;
  seedResult: { success?: boolean; message?: string } | null;
  onSeed: () => void;
}

export const QuickActionsBar = memo(function QuickActionsBar({
  seeding,
  seedResult,
  onSeed,
}: QuickActionsBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            ฐานข้อมูลเอกสารทางการ DSD ฉบับ Signed 28 Sep 2026 (1,004 หน้า)
          </h3>
          <p className="text-xs text-slate-500">
            ระบบสกัดแยก 977 Chunks ครอบคลุม 9 หมวดธุรกิจ (BA-01 ถึง BA-09) พร้อมเลขหน้าอ้างอิงตรงตามเล่ม
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
          <span>สืบค้นเอกสารทั้งหมด</span>
        </Link>

        <Link
          href="/documents/upload"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
        >
          <Upload className="h-3.5 w-3.5 text-slate-500" />
          <span>อัปโหลดเพิ่ม</span>
        </Link>

        <button
          onClick={onSeed}
          disabled={seeding}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
          title="ซิงค์ฐานข้อมูล DSD Signed Chunks เข้าสู่ระบบ Supabase"
        >
          {seeding ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : seedResult?.success ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Database className="h-3.5 w-3.5 text-cyan-400" />
          )}
          <span>{seeding ? "กำลังซิงค์..." : "ซิงค์คลัง DSD"}</span>
        </button>
      </div>
    </div>
  );
});
