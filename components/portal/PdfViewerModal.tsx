"use client";

import React from "react";
import { X, FileText, ExternalLink } from "lucide-react";
import { PreviewPdfState } from "./types";

interface PdfViewerModalProps {
  previewPdf: PreviewPdfState;
  onClose: () => void;
}

export function PdfViewerModal({ previewPdf, onClose }: PdfViewerModalProps) {
  const pdfUrl = `/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf#page=${previewPdf.page}`;

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5">
      <div className="bg-slate-900 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-600 text-white">
                  {previewPdf.code}
                </span>
                <span className="text-xs text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  หน้า {previewPdf.page} จาก 1,004 หน้า
                </span>
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">
                {previewPdf.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <span>เปิดเต็มหน้าต่าง (แท็บใหม่)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="ปิดหน้าต่างอ่าน PDF"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 bg-white"
            title={`PDF Viewer - หน้า ${previewPdf.page}`}
          />

          {/* Bottom status & fallback bar */}
          <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>
              เอกสารทางการ: DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf
            </span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1"
            >
              <span>หากบราวเซอร์ไม่โหลดตัวอย่าง คลิกที่นี่เพื่อเปิดดูโดยตรง</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
