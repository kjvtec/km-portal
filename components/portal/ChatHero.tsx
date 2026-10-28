"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  User,
  Dices,
  Cloud,
} from "lucide-react";
import { NongJiffyAvatar } from "@/components/ui/NongJiffyAvatar";
import { autoLinkBrAndCitations, sanitizeThaiResponse } from "@/lib/utils";
import { BrDetailModal } from "./BrDetailModal";
import { AwsDetailModal } from "./AwsDetailModal";
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
  const [selectedBrCode, setSelectedBrCode] = useState<string | null>(null);
  const [selectedAwsCode, setSelectedAwsCode] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<SuggestedQuestion[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Shuffle and pick 6 questions randomly from the pool
  const shuffleSuggestions = useCallback(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return;
    const shuffled = [...suggestedQuestions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
    setActiveSuggestions(shuffled);
  }, [suggestedQuestions]);

  // Initial random shuffle on client mount
  useEffect(() => {
    shuffleSuggestions();
  }, [shuffleSuggestions]);

  // Auto-scroll ONLY inside the chat container; keeps the outer browser window completely fixed/pinned
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(sanitizeThaiResponse(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectSuggestion = (query: string) => {
    onSendMessage(query);
    // Shuffle suggestions as conversation progresses to discover new topics
    shuffleSuggestions();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;
    setInput("");
    onSendMessage(query);
    // Shuffle suggestions when user sends a question
    shuffleSuggestions();
  };

  const handleReset = () => {
    onResetChat();
    shuffleSuggestions();
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col">
      {/* Chat Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <NongJiffyAvatar
              size="md"
              className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-slate-900"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                <span>น้อง Jiffy (AI Assistant)</span>
              </h2>
              <span className="shrink-0 rounded-md bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold">
                DSD V1.0 Signed
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-300 mt-0.5 truncate">
              ผู้ช่วยตอบคำถามจากเอกสาร DSD ฉบับทางการ 1,004 หน้า (977 Chunks • Groq Qwen 3.8 27B)
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          title="เริ่มบทสนทนาใหม่"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">ล้างการสนทนา</span>
        </button>
      </div>

      {/* Quick Suggested Prompt Chips with Random Shuffle */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-8 py-2 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
        <div className="flex items-center gap-1 shrink-0 pr-1.5 border-r border-slate-200">
          <span className="hidden sm:inline text-[11px] font-bold text-slate-500 uppercase">คำถามแนะนำ:</span>
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
                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      blockquote: ({ children }) => (
                        <div className="not-prose my-3 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white rounded-r-2xl p-3.5 text-slate-800 text-sm shadow-2xs">
                          {children}
                        </div>
                      ),
                      h3: ({ children }) => (
                        <h3 className="not-prose flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base mt-4 mb-2 pb-1.5 border-b border-slate-200">
                          <span className="h-2 w-2 rounded-full bg-blue-600 inline-block shrink-0"></span>
                          <span>{children}</span>
                        </h3>
                      ),
                      ol: ({ children }) => {
                        let stepCount = 0;
                        return (
                          <ol className="not-prose my-2.5 space-y-2 list-none pl-0">
                            {React.Children.map(children, (child) => {
                              if (React.isValidElement(child)) {
                                stepCount++;
                                return React.cloneElement(child as React.ReactElement<any>, {
                                  "data-ordered": true,
                                  "data-step": stepCount,
                                });
                              }
                              return child;
                            })}
                          </ol>
                        );
                      },
                      ul: ({ children }) => (
                        <ul className="not-prose my-2 space-y-2 list-none pl-0">
                          {children}
                        </ul>
                      ),
                      li: (props: any) => {
                        const isOrdered = props["data-ordered"] === true;
                        const stepNumber = props["data-step"] || 1;

                        if (isOrdered) {
                          return (
                            <li className="flex items-start gap-2.5 text-slate-800 text-sm leading-relaxed my-1">
                              <span className="h-5 w-5 rounded-md bg-blue-600 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                {stepNumber}
                              </span>
                              <div className="flex-1 font-medium">{props.children}</div>
                            </li>
                          );
                        }

                        return (
                          <li className="flex items-start gap-2.5 text-slate-800 text-sm leading-relaxed my-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                            <div className="flex-1">{props.children}</div>
                          </li>
                        );
                      },
                      table: ({ children }) => (
                        <div className="not-prose my-3.5 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
                          <table className="w-full text-xs text-left text-slate-700 divide-y divide-slate-200">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-100/90 text-slate-800 font-bold text-xs uppercase tracking-wider">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="px-3.5 py-2.5 font-bold text-slate-900">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-3.5 py-2.5 border-t border-slate-100 text-slate-700">
                          {children}
                        </td>
                      ),
                      hr: () => <hr className="my-3.5 border-slate-200" />,
                      a: ({ href, children }) => {
                        const brMatch =
                          href?.match(/\/documents\/br\/(BR-\d{2}-\d{2}(?:-\d{2})?)/i) ||
                          (typeof children === "string" &&
                            children.match(/^(BR-\d{2}-\d{2}(?:-\d{2})?)/));

                        if (brMatch) {
                          const code = brMatch[1].toUpperCase();
                          return (
                            <a
                              href={`/documents/br/${code}`}
                              onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                                  e.preventDefault();
                                  setSelectedBrCode(code);
                                }
                              }}
                              className="inline-flex items-center font-mono font-bold text-[11px] px-2 py-0.5 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 border border-blue-200/90 transition-colors mx-0.5 cursor-pointer shadow-2xs"
                              title={`คลิกเพื่อเปิดอ่านรายละเอียดข้อกำหนด ${code} ฉบับเต็ม`}
                            >
                              {children}
                            </a>
                          );
                        }

                        const awsMatch =
                          href?.includes("/documents/aws") ||
                          (typeof children === "string" &&
                            children.match(/AWS-(?:\d{2}(?:\.\d)?|[A-Za-z]+)/i));

                        if (awsMatch) {
                          let targetCode = "AWS-01";
                          if (href?.includes("sec=")) {
                            const matchSec = href.match(/sec=([^&#]+)/);
                            if (matchSec) targetCode = decodeURIComponent(matchSec[1]);
                          } else if (href?.includes("page=")) {
                            const matchPage = href.match(/page=([1-6])/);
                            if (matchPage) targetCode = `page-${matchPage[1]}`;
                          } else if (typeof children === "string") {
                            const codeMatch = children.match(/AWS-(?:\d{2}(?:\.\d)?|[A-Za-z]+)/i);
                            if (codeMatch) targetCode = codeMatch[0];
                          }

                          return (
                            <a
                              href={href || `/documents/aws?sec=${targetCode}`}
                              onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                                  e.preventDefault();
                                  setSelectedAwsCode(targetCode);
                                }
                              }}
                              className="inline-flex items-center font-semibold text-[11px] px-2 py-0.5 rounded-md text-amber-900 bg-amber-50 hover:bg-amber-100 hover:text-amber-950 border border-amber-300/80 transition-colors mx-0.5 cursor-pointer shadow-2xs"
                              title={`คลิกเพื่อเปิดอ่านรายละเอียดและ PDF สถาปัตยกรรม AWS (${targetCode})`}
                            >
                              <Cloud className="h-3 w-3 inline mr-1 text-amber-600 shrink-0" />
                              <span>{children}</span>
                            </a>
                          );
                        }

                        const isPdf = href?.includes(".pdf");
                        let pageTooltip = "คลิกเพื่อเปิดลิงก์";
                        if (isPdf) {
                          const pageMatch = href?.match(/#page=(\d+)/);
                          pageTooltip = pageMatch
                            ? `คลิกเพื่อเปิดเอกสาร DSD ฉบับทางการ หน้า ${pageMatch[1]}`
                            : "คลิกเพื่อเปิดเอกสาร DSD ฉบับทางการ";
                        }

                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-600 transition-colors"
                            title={pageTooltip}
                          >
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {autoLinkBrAndCitations(msg.content)}
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
            className="flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-slate-300 px-3.5 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/80 hover:bg-white transition-colors"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all shadow-md ${
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
