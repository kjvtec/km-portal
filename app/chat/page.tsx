"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Send,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Dices,
} from "lucide-react";
import { NongJiffyAvatar } from "@/components/ui/NongJiffyAvatar";
import { allSuggestedQuestions } from "@/components/portal/constants";
import { ChatMessageBubble } from "@/components/portal/ChatMessageBubble";
import { sanitizeThaiResponse } from "@/lib/utils";

const BrDetailModal = dynamic(
  () => import("@/components/portal/BrDetailModal").then((mod) => mod.BrDetailModal),
  { ssr: false }
);

const AwsDetailModal = dynamic(
  () => import("@/components/portal/AwsDetailModal").then((mod) => mod.AwsDetailModal),
  { ssr: false }
);

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

const DEFAULT_WELCOME_CONTENT = `👋 **สวัสดีครับ! ผมคือ น้อง Jiffy ผู้ช่วย AI ประจำโครงการ JIFFY RETAIL POS Replacement** พร้อมตอบคำถามและสืบค้นข้อกำหนดจากเอกสาร DSD ฉบับทางการ (1,004 หน้า) ครบทั้ง 9 หมวด พิมพ์คำถามได้เลยครับ`;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: DEFAULT_WELCOME_CONTENT,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBrCode, setSelectedBrCode] = useState<string | null>(null);
  const [selectedAwsCode, setSelectedAwsCode] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  const [activeSuggestions, setActiveSuggestions] = useState(
    allSuggestedQuestions.slice(0, 6)
  );

  const shuffleSuggestions = () => {
    const shuffled = [...allSuggestedQuestions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
    setActiveSuggestions(shuffled);
  };

  useEffect(() => {
    shuffleSuggestions();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(sanitizeThaiResponse(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput("");
    setError(null);

    const userMessage: Message = {
      id: "u-" + Date.now(),
      role: "user",
      content: userQuery,
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
      console.error("Chat streaming error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to get AI response";
      setError(errMsg);
      // Remove empty assistant placeholder on immediate failure
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId || msg.content.length > 0)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl flex-col px-4 py-4 sm:px-6">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <NongJiffyAvatar size="lg" className="h-11 w-11" />
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>น้อง Jiffy (AI Knowledge Assistant)</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                DSD V1.0 Signed
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              ถาม-ตอบข้อกำหนด DSD ทั้ง 9 หมวด (BA-01 ถึง BA-09), WAC, SOPs, Business Rules รวม 1,004 หน้า
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block mr-2">
            <span className="text-xs font-medium text-slate-500">
              ฐานข้อมูล: <strong className="text-slate-800">JFFPOS Retail (PTTRM)</strong>
            </span>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  id: "welcome-" + Date.now(),
                  role: "assistant",
                  content: DEFAULT_WELCOME_CONTENT,
                },
              ]);
              shuffleSuggestions();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            title="เริ่มบทสนทนาใหม่"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ล้างการสนทนา</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div className="mb-4">
              <NongJiffyAvatar size="xl" className="h-20 w-20 shadow-md ring-4 ring-[#FFB800]/40" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              สวัสดีครับ! ผมคือน้อง Jiffy ผู้ช่วยประจำโครงการ Jiffy Retail
            </h2>
            <p className="max-w-md text-xs text-slate-500 mt-1 mb-6">
              ระบบใช้การสืบค้นแบบ Hybrid RAG จากเอกสาร DSD ฉบับทางการ (1,004 หน้า) เพื่อดึงข้อกำหนดและเนื้อหาที่เกี่ยวข้องมาตอบอย่างแม่นยำ
            </p>

            {/* Suggested Prompt Chips */}
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                  คำถามแนะนำ (Suggested Questions):
                </p>
                <button
                  onClick={shuffleSuggestions}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  title="สุ่มคำถามแนะนำชุดใหม่"
                >
                  <Dices className="h-3.5 w-3.5" />
                  <span>สุ่มคำถามใหม่</span>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeSuggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q.query);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="line-clamp-2">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <ChatMessageBubble
              key={m.id}
              msg={m}
              isCopied={copiedId === m.id}
              onCopy={handleCopy}
              onSelectBr={setSelectedBrCode}
              onSelectAws={setSelectedAwsCode}
              avatarClassName="h-8 w-8"
              userAvatarSize="sm"
            />
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <NongJiffyAvatar size="md" className="h-8 w-8 animate-bounce" />
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#0047BA]" />
              <span>น้อง Jiffy กำลังค้นหาข้อมูลจากฐานความรู้และพิมพ์คำตอบ...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>เกิดข้อผิดพลาดในการเชื่อมต่อ AI: {error}</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถามเกี่ยวกับระบบ POS Vtec Retail หรือข้อกำหนด DSD BA06..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`flex h-11 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-semibold transition-all shadow-sm ${
              isLoading || !input.trim()
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">ส่งคำถาม</span>
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          VTEC Retail Assistant ตอบคำถามโดยอ้างอิงเอกสารข้อกำหนดเชิงเทคนิค DSD BA06 V2.0
        </p>
      </form>

      {selectedBrCode && (
        <BrDetailModal
          brCode={selectedBrCode}
          onClose={() => setSelectedBrCode(null)}
          onAskAi={(prompt) => {
            setSelectedBrCode(null);
            setInput(prompt);
          }}
        />
      )}

      {selectedAwsCode && (
        <AwsDetailModal
          awsCode={selectedAwsCode}
          onClose={() => setSelectedAwsCode(null)}
          onAskAi={(prompt) => {
            setSelectedAwsCode(null);
            setInput(prompt);
          }}
        />
      )}
    </div>
  );
}
