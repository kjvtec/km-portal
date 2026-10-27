"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  User,
} from "lucide-react";
import { NongJiffyAvatar } from "@/components/ui/NongJiffyAvatar";
import { Message } from "./types";

interface SuggestedQuestion {
  label: string;
  query: string;
}

interface ChatHeroProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  suggestedQuestions: SuggestedQuestion[];
  onSendMessage: (query: string) => void;
  onResetChat: () => void;
}

export const ChatHero = memo(function ChatHero({
  messages,
  isLoading,
  error,
  suggestedQuestions,
  onSendMessage,
  onResetChat,
}: ChatHeroProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ONLY inside the chat container; keeps the outer browser window completely fixed/pinned
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;
    setInput("");
    onSendMessage(query);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col">
      {/* Chat Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <NongJiffyAvatar
              size="lg"
              className="h-12 w-12 ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-slate-900"
            />
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>น้อง Jiffy (AI Knowledge Assistant)</span>
              </h2>
              <span className="rounded-md bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-bold">
                DSD V1.0 Signed
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ผู้ช่วยตอบคำถามจากเอกสาร DSD ฉบับทางการ 1,004 หน้า (977 Chunks • Groq Qwen 3.8 27B)
            </p>
          </div>
        </div>

        <button
          onClick={onResetChat}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          title="เริ่มบทสนทนาใหม่"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">ล้างการสนทนา</span>
        </button>
      </div>

      {/* Quick Suggested Prompt Chips */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-8 py-3 overflow-x-auto flex items-center gap-2 text-xs scrollbar-thin">
        <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0">คำถามแนะนำ:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(q.query)}
            disabled={isLoading}
            className="shrink-0 rounded-full border border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50 px-3.5 py-1.5 text-slate-700 transition-colors hover:text-blue-700 text-xs font-medium shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div
        ref={messagesContainerRef}
        className="p-5 sm:p-8 space-y-4 max-h-[500px] min-h-[340px] overflow-y-auto bg-slate-50/50 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 mt-0.5">
                <NongJiffyAvatar
                  size="md"
                  className="h-10 w-10 shadow-sm ring-2 ring-blue-500/20"
                />
              </div>
            )}

            <div
              className={`relative group max-w-[88%] sm:max-w-[82%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs"
                  : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-table:my-3 prose-th:bg-slate-100 prose-th:p-2.5 prose-td:p-2.5 prose-td:border prose-th:border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}

              {msg.role === "assistant" && msg.content && (
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100 transition-all cursor-pointer"
                  title="คัดลอกข้อความ"
                >
                  {copiedId === msg.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>

            {msg.role === "user" && (
              <div className="h-10 w-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5 justify-start items-center text-slate-500 text-xs pl-1">
            <NongJiffyAvatar size="md" className="h-10 w-10 animate-bounce shrink-0" />
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
              <span>น้อง Jiffy กำลังสืบค้นเอกสาร DSD และประมวลผลคำตอบ...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
        {error && (
          <div className="mb-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถามเกี่ยวกับข้อกำหนด DSD (เช่น WAC คำนวณตอนไหน, Tolerance ±5%, DC วังน้อย)..."
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-300 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/80 hover:bg-white transition-colors"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all shadow-md ${
              isLoading || !input.trim()
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-blue-500/25 cursor-pointer"
            }`}
          >
            <span>ส่งคำถาม</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
});
