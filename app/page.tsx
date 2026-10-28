"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, BookOpen, ArrowRight, Upload, Cloud, ExternalLink } from "lucide-react";
import { ChatHero } from "@/components/portal/ChatHero";
import { BusinessModulesGrid } from "@/components/portal/BusinessModulesGrid";
import { QuickActionsBar } from "@/components/portal/QuickActionsBar";
import { businessModules, allSuggestedQuestions } from "@/components/portal/constants";
import { Message, BRItem, PreviewPdfState } from "@/components/portal/types";
import baBrDataRaw from "@/data/ba-br-structure.json";

// Dynamically import modals to optimize initial client bundle size & avoid early DOM overhead
const BrModal = dynamic(
  () => import("@/components/portal/BrModal").then((mod) => mod.BrModal),
  { ssr: false }
);

const PdfViewerModal = dynamic(
  () => import("@/components/portal/PdfViewerModal").then((mod) => mod.PdfViewerModal),
  { ssr: false }
);

const baBrData = baBrDataRaw as Record<string, BRItem[]>;

// Precalculate BR counts per module once outside component render
const brCounts: Record<string, number> = {};
for (const code in baBrData) {
  brCounts[code] = baBrData[code]?.length || 0;
}

const DEFAULT_WELCOME_CONTENT = `👋 **สวัสดีครับ! ผมคือ น้อง Jiffy ผู้ช่วย AI ประจำโครงการ JIFFY RETAIL POS Replacement** พร้อมตอบคำถามและสืบค้นข้อกำหนดจากเอกสาร DSD ฉบับทางการ (1,004 หน้า) ครบทั้ง 9 หมวด พิมพ์คำถามได้เลยครับ`;

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: DEFAULT_WELCOME_CONTENT,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBA, setSelectedBA] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<PreviewPdfState | null>(null);

  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleSendMessage = useCallback(
    async (queryText: string) => {
      if (!queryText.trim() || isLoading) return;

      setError(null);

      const userMessage: Message = {
        id: "u-" + Date.now(),
        role: "user",
        content: queryText.trim(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);

      const assistantMessageId = "a-" + Date.now();
      const assistantMessagePlaceholder: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };

      setMessages([...newMessages, assistantMessagePlaceholder]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with status ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response stream received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedText }
                : msg
            )
          );
        }
      } catch (err: unknown) {
        console.error("Chat error:", err);
        const errMsg = err instanceof Error ? err.message : "Failed to get AI response";
        setError(errMsg);
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessageId || msg.content.length > 0)
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleResetChat = useCallback(() => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: DEFAULT_WELCOME_CONTENT,
      },
    ]);
  }, []);

  const handleSeed = useCallback(async () => {
    try {
      setSeeding(true);
      setSeedResult(null);

      const res = await fetch("/api/documents/seed", {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setSeedResult({
          success: true,
          message: data.message || `ซิงค์สำเร็จ ${data.chunkCount} Chunks!`,
        });
      } else {
        setSeedResult({
          success: false,
          message: data.error || "เกิดข้อผิดพลาดในการซิงค์ข้อมูล",
        });
      }
    } catch (err: unknown) {
      setSeedResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setSeeding(false);
    }
  }, []);

  const selectedModuleInfo = useMemo(
    () => businessModules.find((m) => m.code === selectedBA),
    [selectedBA]
  );

  const currentBRList = useMemo(
    () => (selectedBA ? baBrData[selectedBA] || [] : []),
    [selectedBA]
  );

  const handleAskAiFromBR = useCallback(
    (br: BRItem) => {
      setSelectedBA(null);
      handleSendMessage(
        `ขอสรุปรายละเอียดข้อกำหนด ${br.code}: ${br.title} ในเอกสาร DSD หน้า ${br.page || 1} อย่างละเอียด`
      );
      const chatEl = document.getElementById("chat-section");
      if (chatEl) {
        chatEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [handleSendMessage]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* 1. Hero Section - Original Dark Sleek Tech Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>DSD PTTRM JIFFY RETAIL V1.0 (Signed 1,004 หน้า)</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-sm">
              <Cloud className="h-3.5 w-3.5 text-amber-400" />
              <span>AWS Cloud Infrastructure DEV v1.5 (DailiTech)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            VTEC Retail{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Knowledge Base
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
            ศูนย์กลางการจัดการองค์ความรู้ สถาปัตยกรรมระบบ และข้อกำหนดการออกแบบฉบับลงนามทางการ{" "}
            <strong className="text-white">JIFFY RETAIL POS Replacement Project (PTTRM)</strong>{" "}
            ครอบคลุมครบทั้ง 9 หมวดธุรกิจ (
            <strong className="text-cyan-300">BA-01 ถึง BA-09</strong> รวม 1,004 หน้า)
            และสถาปัตยกรรมคลาวด์ <strong className="text-amber-300">AWS DEV Environment v1.5</strong> พร้อมระบบผู้ช่วย AI ค้นหาและตอบคำถามระบุเอกสารอ้างอิงทันที
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-cyan-400 hover:to-blue-500"
            >
              <BookOpen className="h-4 w-4" />
              <span>ดูคลังเอกสารทั้งหมด</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>

            <Link
              href="/documents/aws"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-500/20 hover:text-white transition-colors"
            >
              <Cloud className="h-4 w-4 text-amber-400" />
              <span>รายงานสรุป AWS DEV</span>
            </Link>

            <a
              href="/docs/PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <span>PDF AWS (6 หน้า)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Central Hero: AI Chatbot (Centered & Fully Interactive) */}
      <div id="chat-section">
        <ChatHero
          messages={messages}
          isLoading={isLoading}
          error={error}
          suggestedQuestions={allSuggestedQuestions}
          onSendMessage={handleSendMessage}
          onResetChat={handleResetChat}
        />
      </div>

      {/* 3. Quick Actions & Status Bar */}
      <QuickActionsBar
        seeding={seeding}
        seedResult={seedResult}
        onSeed={handleSeed}
      />

      {/* 4. 9 Business Areas Grid (BA-01 to BA-09) */}
      <BusinessModulesGrid
        modules={businessModules}
        brCounts={brCounts}
        onSelectBA={setSelectedBA}
      />

      {/* 5. Sub-requirements Modal (Loaded Dynamically) */}
      {selectedBA && (
        <BrModal
          selectedBA={selectedBA}
          moduleInfo={selectedModuleInfo}
          brList={currentBRList}
          onClose={() => setSelectedBA(null)}
          onPreviewPdf={setPreviewPdf}
          onAskAi={handleAskAiFromBR}
        />
      )}

      {/* 6. In-App PDF Viewer Modal (Loaded Dynamically) */}
      {previewPdf && (
        <PdfViewerModal
          previewPdf={previewPdf}
          onClose={() => setPreviewPdf(null)}
        />
      )}
    </div>
  );
}
