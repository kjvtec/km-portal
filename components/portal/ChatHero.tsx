"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import {
  Send,
  Sparkles,
  RefreshCw,
  Dices,
} from "lucide-react";
import { NongJiffyAvatar } from "@/components/ui/NongJiffyAvatar";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { Message } from "./types";

// Dynamic import modals to reduce initial bundle size by ~1MB
const BrDetailModal = dynamic(
  () => import("./BrDetailModal").then((mod) => mod.BrDetailModal),
  { ssr: false }
);

const AwsDetailModal = dynamic(
  () => import("./AwsDetailModal").then((mod) => mod.AwsDetailModal),
  { ssr: false }
);

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
  const [selectedBrCode, setSelectedBrCode] = useState<string | null>(null);
  const [selectedAwsCode, setSelectedAwsCode] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<SuggestedQuestion[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suggestedQuestions.length > 0) {
      setActiveSuggestions(suggestedQuestions.slice(0, 4));
    }
  }, [suggestedQuestions]);

  const shuffleSuggestions = useCallback(() => {
    if (suggestedQuestions.length <= 4) return;
    const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
    setActiveSuggestions(shuffled.slice(0, 4));
  }, [suggestedQuestions]);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleSelectSuggestion = (query: string) => {
    if (isLoading) return;
    onSendMessage(query);
  };

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return (
    <div className="relative rounded-3xl border border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Chat Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <NongJiffyAvatar
              size="md"
              className="h-9 w-9 shadow-sm ring-2 ring-blue-500/20"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-none">
                น้อง Jiffy AI Assistant
              </h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 tracking-wide uppercase">
                DSD + AWS DEV
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              พร้อมตอบคำถามข้อกำหนด DSD V1.0 และโครงสร้างคลาวด์ AWS
            </p>
          </div>
        </div>

        <button
          onClick={onResetChat}
          className="group flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
          title="เริ่มบทสนทนาใหม่"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="hidden sm:inline">ล้างบทสนทนา</span>
        </button>
      </div>

      {/* Suggested Questions Quick Bar */}
      <div className="bg-slate-100/60 px-4 py-2 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">คำถามแนะนำ:</span>
          </span>
          <button
            onClick={shuffleSuggestions}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            title="คลิกเพื่อสุ่มคำถามแนะนำชุดใหม่จากคลัง DSD"
          >
            <Dices className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span>สุ่มใหม่</span>
          </button>
        </div>

        {activeSuggestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectSuggestion(q.query)}
            disabled={isLoading}
            className="shrink-0 rounded-full border border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50 px-3 py-1.5 text-slate-700 transition-colors hover:text-blue-700 text-xs font-medium shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
          >
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div
        ref={messagesContainerRef}
        className="p-5 sm:p-8 space-y-4 max-h-[500px] min-h-[340px] overflow-y-auto bg-slate-50/50 scroll-smooth"
      >
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            msg={msg}
            isCopied={copiedId === msg.id}
            onCopy={handleCopy}
            onSelectBr={setSelectedBrCode}
            onSelectAws={setSelectedAwsCode}
          />
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
      <div className="p-3 sm:p-5 bg-white border-t border-slate-200">
        {error && (
          <div className="mb-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถามเกี่ยวกับข้อกำหนด DSD หรือ AWS..."
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-3.5 sm:px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 sm:px-6 py-3 text-sm font-bold transition-all shadow-md shrink-0 ${
              isLoading || !input.trim()
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-blue-500/25 cursor-pointer"
            }`}
          >
            <span className="hidden sm:inline">ส่งคำถาม</span>
            <Send className="h-4 w-4 shrink-0" />
          </button>
        </form>
      </div>

      {selectedBrCode && (
        <BrDetailModal
          brCode={selectedBrCode}
          onClose={() => setSelectedBrCode(null)}
          onAskAi={(prompt) => {
            setSelectedBrCode(null);
            onSendMessage(prompt);
          }}
        />
      )}

      {selectedAwsCode && (
        <AwsDetailModal
          awsCode={selectedAwsCode}
          onClose={() => setSelectedAwsCode(null)}
          onAskAi={(prompt) => {
            setSelectedAwsCode(null);
            onSendMessage(prompt);
          }}
        />
      )}
    </div>
  );
});
