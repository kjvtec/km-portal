"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  FileText,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { BRItem, BusinessModule, PreviewPdfState } from "./types";

interface BrModalProps {
  selectedBA: string;
  moduleInfo?: BusinessModule;
  brList: BRItem[];
  onClose: () => void;
  onPreviewPdf: (state: PreviewPdfState) => void;
  onAskAi: (br: BRItem) => void;
}

export function BrModal({
  selectedBA,
  moduleInfo,
  brList,
  onClose,
  onPreviewPdf,
  onAskAi,
}: BrModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBRs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return brList;
    return brList.filter(
      (br) => br.code.toLowerCase().includes(q) || br.title.toLowerCase().includes(q)
    );
  }, [brList, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                {selectedBA}
              </span>
              <span className="text-xs text-slate-300">
                {moduleInfo?.pages}
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {brList.length} ข้อย่อยทั้งหมด
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {moduleInfo?.name} ({moduleInfo?.en})
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {moduleInfo?.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a
              href="/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 hover:text-white transition-colors cursor-pointer"
              title="เปิดดูเอกสาร PDF ฉบับเต็ม (1,004 หน้า) ในแท็บใหม่"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">เปิด DSD PDF ฉบับเต็ม</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>

            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="ปิดหน้าต่าง"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Filter Bar inside Modal */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`ค้นหาข้อกำหนดข้อย่อยในหมวด ${selectedBA} (เช่น รหัส BR, ชื่อเรื่อง หรือคำค้น)...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-slate-500 hover:text-slate-700 underline shrink-0 cursor-pointer"
            >
              ล้างค้นหา
            </button>
          )}
        </div>

        {/* Hint Bar */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 py-2 text-[11px] text-amber-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <FileText className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>คลิกที่รายการข้อกำหนด หรือคลิกปุ่ม &quot;เปิด PDF&quot; เพื่อเปิดดูหน้าข้อกำหนดนั้นในเอกสารจริงได้ทันที</span>
          </span>
        </div>

        {/* BR Sub-requirements List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {filteredBRs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              ไม่พบข้อกำหนดที่ตรงกับคำค้นหา &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredBRs.map((br, idx) => {
              const pageNum = br.page || 1;
              const pdfUrl = `/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf#page=${pageNum}`;
              return (
                <div
                  key={idx}
                  className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-blue-50/50 px-3.5 rounded-xl transition-all group"
                >
                  {/* Clickable Title & Details */}
                  <div
                    onClick={() => onPreviewPdf({ page: pageNum, code: br.code, title: br.title })}
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                    title={`คลิกเพื่อเปิดเอกสาร DSD PDF หน้า ${pageNum}`}
                  >
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 shrink-0 mt-0.5 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {br.code}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 leading-snug transition-colors flex items-center gap-1.5">
                        <span>{br.title}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="text-blue-600 group-hover:underline">คลิกเปิดดู PDF ข้อนี้</span>
                        <span>•</span>
                        <span className="text-slate-500 font-medium">หน้า {pageNum} / 1004</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onPreviewPdf({ page: pageNum, code: br.code, title: br.title })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 hover:border-amber-400 transition-all cursor-pointer shadow-2xs group/btn"
                      title={`เปิดดู PDF หน้า ${pageNum}`}
                    >
                      <FileText className="h-3.5 w-3.5 text-amber-700" />
                      <span>เปิด PDF หน้า {pageNum}</span>
                    </button>

                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title={`เปิด PDF หน้า ${pageNum} ในแท็บใหม่`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <button
                      onClick={() => onAskAi(br)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      title="ถาม AI เพิ่มเติมเกี่ยวกับข้อกำหนดนี้"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>ถาม AI</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span>
            แสดง {filteredBRs.length} จากทั้งหมด {brList.length} ข้อกำหนด (เอกสารรวม 1,004 หน้า)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
