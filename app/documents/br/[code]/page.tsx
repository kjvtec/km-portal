import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrDetail, getAllBrDetails } from "@/lib/br-details";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  ExternalLink,
  Sparkles,
  Copy,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { BrContentRenderer } from "@/components/portal/BrContentRenderer";

export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateStaticParams() {
  const details = getAllBrDetails();
  return details
    .filter((d) => /^[A-Za-z0-9_-]+$/.test(d.code))
    .map((d) => ({ code: d.code }));
}

export default async function BrDetailPage({ params }: PageProps) {
  const { code } = await params;
  const detail = getBrDetail(decodeURIComponent(code));

  if (!detail) {
    notFound();
  }

  const pdfUrl = `/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf#page=${detail.page}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
          <span>หน้าหลัก KM Portal</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <Link href="/documents" className="hover:text-blue-600 transition-colors">
          <span>หมวดเอกสาร</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {detail.code}
        </span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-xs px-3 py-1 rounded-lg bg-blue-600 text-white shadow-sm">
              {detail.code}
            </span>
            <span className="text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-1 rounded-lg">
              หมวด {detail.baCode}
            </span>
            <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
              เอกสาร DSD ฉบับทางการ หน้า {detail.page} / 1,004
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg ml-auto">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Signed 28 Sep 2026</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
            {detail.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/?q=${encodeURIComponent(`ขอทราบรายละเอียดของข้อกำหนด ${detail.code} (${detail.title})`)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>ถาม AI เกี่ยวกับข้อกำหนดนี้</span>
            </Link>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <FileText className="h-4 w-4 text-amber-400" />
              <span>เปิดดูหน้า {detail.page} ในไฟล์ PDF</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Requirement Details Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-sm space-y-6">
        <BrContentRenderer
          code={detail.code}
          title={detail.title}
          content={detail.content}
          page={detail.page}
          baCode={detail.baCode}
        />
      </div>

      {/* In-Page PDF Preview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>พรีวิวหน้าเอกสารจริง (DSD หน้า {detail.page})</span>
          </h3>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <span>เปิดเต็มหน้าจอ</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 bg-white"
            title={`PDF Page ${detail.page}`}
          />
        </div>
      </div>
    </div>
  );
}
