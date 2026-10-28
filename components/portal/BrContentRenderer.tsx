"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Info,
  CreditCard,
  Sliders,
  Cpu,
  ArrowRight
} from "lucide-react";
import { cleanThaiOcrText } from "@/lib/utils";

interface BrContentRendererProps {
  code: string;
  title: string;
  content: string;
  page: number;
  baCode: string;
  baName?: string;
  onAskAi?: (question: string) => void;
}

interface ParsedSubSection {
  title: string;
  type: "workflow" | "fallback" | "rules" | "table" | "general";
  lines: string[];
}

export function BrContentRenderer({
  code,
  title,
  content,
  page,
  baCode,
  baName,
  onAskAi,
}: BrContentRendererProps) {
  const [viewMode, setViewMode] = useState<"structured" | "clean">("structured");
  const [copiedText, setCopiedText] = useState(false);

  // 1. Clean Thai OCR encoding artifacts across the content
  const cleanedFullText = React.useMemo(() => {
    return cleanThaiOcrText(content);
  }, [content]);

  // 2. Parse content into semantic sections
  const parsedData = React.useMemo(() => {
    const rawLines = cleanedFullText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Filter out redundant line 0 if it simply echoes the code or title
    const lines: string[] = [];
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (i === 0 && (line === code || line.startsWith(code))) {
        continue;
      }
      lines.push(line);
    }

    const brLines: string[] = [];
    const sdMainLines: string[] = [];
    const subSections: ParsedSubSection[] = [];
    const pendingLines: string[] = [];

    let currentSection: "intro" | "br" | "sd" | "pending" = "intro";
    let activeSubSection: ParsedSubSection | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      // Detect Pending Issue section
      if (
        lower.includes("pending issue") ||
        lower.includes("issue pending") ||
        lower.includes("ไม่มีประเด็นค้าง") ||
        lower.includes("ไม่มีประเด็นคงค้าง")
      ) {
        currentSection = "pending";
        activeSubSection = null;
        if (!lower.startsWith("pending issue") && !lower.startsWith("issue pending")) {
          pendingLines.push(line);
        }
        continue;
      }

      // Detect Business Requirement section
      if (
        lower.startsWith("business requirement:") ||
        lower === "business requirement" ||
        (lower.includes("b.2 system design details") && i === 0)
      ) {
        currentSection = "br";
        activeSubSection = null;
        const remainder = line.replace(/^business requirement:?/i, "").trim();
        if (remainder && !remainder.startsWith(code)) {
          brLines.push(remainder);
        }
        continue;
      }

      // Detect System Design section
      if (
        lower.startsWith("system design") ||
        lower.startsWith("susyem design") ||
        lower.includes("แนวทางการออกแบบระบบ")
      ) {
        currentSection = "sd";
        activeSubSection = null;
        continue;
      }

      // Check if this line is a sub-workflow header (e.g. "การบันทึกการชำระเงิน Credit Card Manual", "2. Business Rules & Validation")
      const isSubHeading =
        currentSection === "sd" &&
        line.length < 75 &&
        !line.startsWith("•") &&
        !line.startsWith("▪") &&
        !line.startsWith("-") &&
        (line.startsWith("การบันทึก") ||
          line.startsWith("การกดชำระ") ||
          line.startsWith("ขั้นตอนการ") ||
          line.startsWith("โครงสร้าง") ||
          line.startsWith("Business Rules") ||
          line.startsWith("Key Design") ||
          line.startsWith("Field Description") ||
          /^\d+[\.\)]\s+[A-Za-zก-๙]/.test(line));

      if (isSubHeading) {
        let type: ParsedSubSection["type"] = "general";
        if (line.includes("Manual") || line.includes("Offline") || line.includes("ผิดพลาด")) {
          type = "fallback";
        } else if (line.includes("Rules") || line.includes("Validation")) {
          type = "rules";
        } else if (line.includes("Field Description")) {
          type = "table";
        } else if (line.includes("ขั้นตอน") || line.includes("การกดชำระ") || /^\d+[\.\)]/.test(line)) {
          type = "workflow";
        }

        activeSubSection = {
          title: line,
          type,
          lines: [],
        };
        subSections.push(activeSubSection);
        continue;
      }

      // Accumulate into appropriate section
      if (activeSubSection) {
        activeSubSection.lines.push(line);
      } else if (currentSection === "sd") {
        sdMainLines.push(line);
      } else if (currentSection === "br") {
        brLines.push(line);
      } else if (currentSection === "pending") {
        pendingLines.push(line);
      } else {
        // Uncategorized intro lines go to BR
        brLines.push(line);
      }
    }

    return {
      brLines,
      sdMainLines,
      subSections,
      pendingLines,
      hasPendingNone:
        pendingLines.some(
          (l) => l.includes("ไม่มีประเด็นค้าง") || l.includes("ไม่มีประเด็นคงค้าง")
        ) ||
        cleanedFullText.includes("ไม่มีประเด็นค้าง") ||
        cleanedFullText.includes("ไม่มีประเด็นคงค้าง"),
    };
  }, [cleanedFullText, code]);

  const handleCopyClean = () => {
    navigator.clipboard.writeText(cleanedFullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* View Switcher Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode("structured")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "structured"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>จัดหมวดหมู่สวยงาม</span>
          </button>
          <button
            onClick={() => setViewMode("clean")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "clean"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span>ข้อความจัดระเบียบ</span>
          </button>
        </div>

        <button
          onClick={handleCopyClean}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          title="คัดลอกข้อกำหนดฉบับปรับแก้คำผิดแล้ว"
        >
          {copiedText ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">คัดลอกสำเร็จ</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              <span>คัดลอกข้อกำหนด</span>
            </>
          )}
        </button>
      </div>

      {viewMode === "clean" ? (
        /* Clean Text View */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {code} • ฉบับคลีนคำผิด (DSD Signed V1.0)
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              หน้า {page} / 1,004
            </span>
          </div>
          <div className="font-sans text-sm text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-blue-100">
            {cleanedFullText}
          </div>
        </div>
      ) : (
        /* Structured Executive Design View */
        <div className="space-y-4">
          {/* Header Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white p-5 sm:p-6 shadow-md border border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-500 text-white shadow-2xs">
                {code}
              </span>
              <span className="text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-1 rounded-lg">
                หมวด {baCode} {baName ? `• ${baName}` : ""}
              </span>
              <span className="text-xs font-semibold text-blue-200 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-lg">
                DSD PDF หน้า {page} จาก 1,004 หน้า
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>เอกสารลงนามทางการ V1.0</span>
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
              {title}
            </h2>
          </div>

          {/* Section 1: Business Requirement */}
          {parsedData.brLines.length > 0 && (
            <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-100/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-blue-950">
                      ความต้องการทางธุรกิจ (Business Requirement)
                    </h3>
                    <p className="text-[11px] text-blue-700">
                      วัตถุประสงค์และข้อกำหนดฟังก์ชันงานหลักตามขอบเขตสัญญา
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-blue-600 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                  ข้อกำหนดสำคัญ
                </span>
              </div>

              <div className="space-y-2.5 text-slate-800 text-sm leading-relaxed">
                {parsedData.brLines.map((line, idx) => {
                  const isBullet =
                    line.startsWith("•") || line.startsWith("▪") || line.startsWith("-");
                  const cleanText = line.replace(/^[•▪\-]\s*/, "");

                  if (isBullet) {
                    return (
                      <div key={idx} className="flex items-start gap-2.5 pl-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                        <span className="flex-1 font-medium text-slate-800">
                          {cleanText}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <p key={idx} className="font-medium text-slate-800 leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: System Design & Specifications */}
          {parsedData.sdMainLines.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Sliders className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      การออกแบบระบบ (System Design & Logic)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ตรรกะการประมวลผล สถาปัตยกรรม และการรองรับฟังก์ชัน
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {renderFormattedLines(parsedData.sdMainLines)}
              </div>
            </div>
          )}

          {/* Section 3: Sub-Sections (Workflows, Fallbacks, Rules) */}
          {parsedData.subSections.map((sub, sIdx) => {
            const isFallback = sub.type === "fallback";
            const isRules = sub.type === "rules";

            const cardBorder = isFallback
              ? "border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40"
              : isRules
              ? "border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30"
              : "border-slate-200 bg-white";

            const iconBg = isFallback
              ? "bg-amber-600 text-white"
              : isRules
              ? "bg-purple-600 text-white"
              : "bg-blue-600 text-white";

            const IconComp = isFallback
              ? AlertTriangle
              : isRules
              ? ShieldCheck
              : Layers;

            return (
              <div
                key={sIdx}
                className={`rounded-2xl border ${cardBorder} p-5 sm:p-6 shadow-xs space-y-3.5`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-7 w-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      {sub.title}
                    </h4>
                  </div>
                  {isFallback && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                      กรณีฉุกเฉิน / สำรอง
                    </span>
                  )}
                  {isRules && (
                    <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                      กฎระเบียบ & การตรวจสอบ
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {renderFormattedLines(sub.lines, isFallback)}
                </div>
              </div>
            );
          })}

          {/* Section 4: Pending Issues & Sign-off Status */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
              parsedData.hasPendingNone
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-teal-50/50"
                : "border-amber-200 bg-amber-50/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  parsedData.hasPendingNone
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {parsedData.hasPendingNone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {parsedData.hasPendingNone
                    ? "สถานะข้อกำหนด: ตรวจรับสมบูรณ์ (Approved & Signed)"
                    : "ประเด็นคงค้าง & สิ่งที่ต้องติดตาม (Pending Issues)"}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {parsedData.hasPendingNone
                    ? "ไม่มีประเด็นคงค้างในเอกสาร DSD PTTRM JIFFY RETAIL V1.0 ที่ลงนามแล้ว"
                    : parsedData.pendingLines.join(", ")}
                </p>
              </div>
            </div>

            {parsedData.hasPendingNone && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-xl shrink-0">
                <Check className="h-3.5 w-3.5" />
                <span>ผ่านการตรวจรับ 100%</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper to render lines with step sequence pills, bullet lists, and highlight cards
 */
function renderFormattedLines(lines: string[], isFallback = false) {
  // Check if lines contain numbered steps
  const hasNumberedSteps = lines.some((l) => /^\d+[\.\)]\s*/.test(l));

  if (hasNumberedSteps) {
    const steps: { number: string; text: string }[] = [];
    const nonStepLines: string[] = [];

    for (const line of lines) {
      const match = line.match(/^(\d+)[\.\)]\s*(.+)/);
      if (match) {
        steps.push({ number: match[1], text: match[2] });
      } else {
        nonStepLines.push(line);
      }
    }

    return (
      <div className="space-y-3.5">
        {nonStepLines.length > 0 && (
          <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
            {nonStepLines.map((nl, nIdx) => (
              <p key={nIdx}>{nl}</p>
            ))}
          </div>
        )}

        <div className="space-y-2.5">
          {steps.map((st, sIdx) => (
            <div
              key={sIdx}
              className={`flex items-start gap-3 rounded-xl p-3 border transition-colors ${
                isFallback
                  ? "bg-amber-100/50 border-amber-200/80 hover:bg-amber-100/80"
                  : "bg-slate-50/90 border-slate-200 hover:bg-blue-50/40 hover:border-blue-200"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
                  isFallback
                    ? "bg-amber-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {st.number.padStart(2, "0")}
              </div>
              <div className="flex-1 text-sm text-slate-800 font-medium leading-relaxed">
                {st.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard paragraph & bullet list rendering
  return (
    <div className="space-y-2.5 text-sm text-slate-800 leading-relaxed">
      {lines.map((line, idx) => {
        const isBullet =
          line.startsWith("•") || line.startsWith("▪") || line.startsWith("-");
        const cleanText = line.replace(/^[•▪\-]\s*/, "");

        if (isBullet) {
          return (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/80 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span className="flex-1 font-medium text-slate-800">
                {cleanText}
              </span>
            </div>
          );
        }

        // Highlight callout for payment card lists or key rules
        if (
          line.includes("Visa, Mastercard") ||
          line.includes("ไม่ทำการปัดเศษ") ||
          line.includes("ชำระตามจำนวนจริง")
        ) {
          return (
            <div
              key={idx}
              className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-blue-950 font-medium flex items-start gap-2.5"
            >
              <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{line}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="font-normal text-slate-800 leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}
