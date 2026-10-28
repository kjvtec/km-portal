"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Share2,
} from "lucide-react";
import { getBrDetail, BrDetail } from "@/lib/br-details";
import { cleanThaiOcrText } from "@/lib/utils";
import { BrContentRenderer } from "./BrContentRenderer";

interface BrDetailModalProps {
  brCode: string;
  onClose: () => void;
  onAskAi?: (query: string) => void;
}

const baNames: Record<string, string> = {
  "BA-01": "โครงสร้างข้อมูลหลัก (Key Data Structure)",
  "BA-02": "การบริหารจัดการสินค้าและคลัง (Inventory & Cost)",
  "BA-03": "ระบบสมาชิกและโปรโมชั่น (Loyalty & Promotion)",
  "BA-04": "การชำระเงินและธุรกรรม POS (Payment & POS)",
  "BA-05": "การปฏิบัติงานหน้าร้าน (Store Front Operations)",
  "BA-06": "การจัดการเงินสดและรอบการขาย (Cash & Shift Management)",
  "BA-07": "การแลกเปลี่ยนข้อมูลระบบภายนอก (Integration & API)",
  "BA-08": "การจัดการผู้ใช้และสิทธิ์ความปลอดภัย (Security & Authorization)",
  "BA-09": "พจนานุกรมข้อมูลระบบ (Data Dictionary)",
};

export function BrDetailModal({ brCode, onClose, onAskAi }: BrDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "pdf">("detail");

  const detail: BrDetail | null = getBrDetail(brCode);

  if (!detail) {
    return (
      <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">ไม่พบข้อกำหนด</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            ไม่พบข้อมูลสำหรับรหัสข้อกำหนด <strong>{brCode}</strong> ในระบบ DSD V1.0
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  const baName = baNames[detail.baCode] || detail.baCode;
  const cleanTitle = cleanThaiOcrText(detail.title);
  const pdfUrl = `/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf#page=${detail.page}`;

  const handleCopyContent = () => {
    const cleaned = cleanThaiOcrText(detail.content);
    const textToCopy = `[${detail.code}] ${cleanTitle}\nหมวด: ${baName} (หน้า ${detail.page} DSD V1.0)\n\n${cleaned}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/documents/br/${detail.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAsk = () => {
    if (onAskAi) {
      onAskAi(`ขอทราบรายละเอียดและการทำงานของข้อกำหนด ${detail.code} (${cleanTitle}) ในหมวด ${detail.baCode}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/20 text-cyan-400 border border-blue-400/30 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="truncate">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-blue-600 text-white shadow-2xs">
                  {detail.code}
                </span>
                <span className="text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-lg">
                  {detail.baCode}: {baName}
                </span>
                <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                  DSD หน้า {detail.page} / 1,004
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                {cleanTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
            title="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab & Action Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("detail")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === "detail"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="hidden sm:inline">เนื้อหาข้อกำหนดฉบับทางการ</span>
              <span className="sm:hidden">รายละเอียด</span>
            </button>
            <button
              onClick={() => setActiveTab("pdf")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                activeTab === "pdf"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span>PDF หน้า {detail.page}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-wrap">
            <button
              onClick={handleCopyContent}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="คัดลอกข้อกำหนด"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 font-semibold text-[11px] sm:text-xs">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-[11px] sm:text-xs">คัดลอก</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="คัดลอกลิงก์แชร์ข้อกำหนดนี้"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 font-semibold text-[11px] sm:text-xs">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-[11px] sm:text-xs">แชร์</span>
                </>
              )}
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-300 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title={`เปิดไฟล์ PDF หน้า ${detail.page} ในแท็บใหม่`}
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">เปิด PDF แท็บใหม่</span>
            </a>

            {onAskAi && (
              <button
                onClick={handleAsk}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] sm:text-xs">ถาม AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50">
          {activeTab === "detail" ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              <BrContentRenderer
                code={detail.code}
                title={cleanTitle}
                content={detail.content}
                page={detail.page}
                baCode={detail.baCode}
                baName={baName}
                onAskAi={onAskAi ? handleAsk : undefined}
              />

              <div className="rounded-2xl border border-blue-200/90 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3 shadow-2xs">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">ต้องการวิเคราะห์หรือถามประเด็นเพิ่มเติมเกี่ยวกับข้อนี้?</p>
                  <p className="text-blue-800 leading-relaxed">
                    คลิกปุ่ม <strong>&quot;ถาม AI&quot;</strong> เพื่อให้น้อง Jiffy อธิบายข้อย่อยนี้ สรุปขั้นตอน หรือตรวจสอบความสัมพันธ์กับระบบอื่นได้ทันที
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col rounded-2xl overflow-hidden border border-slate-300 bg-white">
              <iframe
                src={pdfUrl}
                className="w-full flex-1 border-0"
                title={`DSD PDF หน้า ${detail.page}`}
              />
              <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>เปิดดูเอกสาร PDF ฉบับทางการ หน้า {detail.page} จาก 1,004 หน้า</span>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>เปิดเต็มจอในแท็บใหม่</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            ข้อกำหนด <strong>{detail.code}</strong> • หมวด {detail.baCode} ({baName})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
