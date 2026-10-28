"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  X,
  FileText,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Share2,
  Cloud,
  ShieldCheck,
} from "lucide-react";
import { getAwsDetail, AwsDetail } from "@/lib/aws-details";

interface AwsDetailModalProps {
  awsCode: string;
  onClose: () => void;
  onAskAi?: (query: string) => void;
}

export function AwsDetailModal({ awsCode, onClose, onAskAi }: AwsDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "pdf">("detail");

  const detail: AwsDetail | null = getAwsDetail(awsCode);

  if (!detail) {
    return (
      <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">ไม่พบหัวข้อ AWS</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            ไม่พบข้อมูลสำหรับหัวข้อ <strong>{awsCode}</strong> ในเอกสารสรุปทรัพยากร AWS DEV
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  const pdfUrl = `/docs/PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf#page=${detail.page}`;

  const handleCopyContent = () => {
    const textToCopy = `[${detail.code}] ${detail.title}\nอ้างอิง: ${detail.section} (หน้า ${detail.page} / 6)\n\n${detail.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/documents/aws?sec=${detail.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAsk = () => {
    if (onAskAi) {
      onAskAi(`ขอทราบรายละเอียดและการทำงานของหัวข้อ ${detail.code} (${detail.title}) ในระบบ AWS DEV`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white px-6 py-4.5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Cloud className="h-5 w-5" />
            </div>
            <div className="truncate">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-2xs font-semibold">
                  {detail.code}
                </span>
                <span className="text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-lg">
                  AWS DEV v1.5
                </span>
                <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                  PDF หน้า {detail.page} / 6
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-lg">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>DailiTech</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                {detail.title}
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
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("detail")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "detail"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              เนื้อหาและข้อกำหนดเชิงเทคนิค
            </button>
            <button
              onClick={() => setActiveTab("pdf")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "pdf"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>เอกสาร PDF ฉบับจริง (หน้า {detail.page})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="คัดลอกข้อกำหนด"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="คัดลอกลิงก์แชร์หัวข้อนี้"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">คัดลอกลิงก์แล้ว</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>แชร์</span>
                </>
              )}
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title={`เปิดไฟล์ PDF หน้า ${detail.page} ในแท็บใหม่`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>เปิด PDF แท็บใหม่</span>
            </a>

            {onAskAi && (
              <button
                onClick={handleAsk}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>ถาม AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === "detail" ? (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {detail.section}
                  </span>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    PDF หน้า {detail.page} จาก 6 หน้า
                  </span>
                </div>

                <div className="prose prose-slate max-w-none text-sm leading-relaxed prose-table:text-xs prose-th:bg-slate-100 prose-td:border-slate-200 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-code:text-blue-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {detail.content}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">ต้องการวิเคราะห์หรือถามประเด็นเพิ่มเติมเกี่ยวกับ AWS หัวข้อนี้?</p>
                  <p className="text-amber-800 leading-relaxed">
                    คลิกปุ่ม <strong>&quot;ถาม AI&quot;</strong> เพื่อให้น้อง Jiffy อธิบายการตั้งค่า สรุปคำสั่ง CLI หรือตรวจสอบความสัมพันธ์กับระบบ POS ได้ทันที
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col rounded-2xl overflow-hidden border border-slate-300 bg-white">
              <iframe
                src={pdfUrl}
                className="w-full flex-1 border-0"
                title={`AWS DEV PDF หน้า ${detail.page}`}
              />
              <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>เปิดดูเอกสาร PDF สรุปทรัพยากร AWS DEV หน้า {detail.page} จาก 6 หน้า</span>
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
            รหัสอ้างอิง <strong>{detail.code}</strong> • {detail.section}
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
