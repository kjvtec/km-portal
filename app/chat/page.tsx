"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Bot,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
  Dices,
  Cloud,
} from "lucide-react";
import { NongJiffyAvatar } from "@/components/ui/NongJiffyAvatar";
import { autoLinkBrAndCitations, sanitizeThaiResponse } from "@/lib/utils";
import { allSuggestedQuestions } from "@/components/portal/constants";
import { BrDetailModal } from "@/components/portal/BrDetailModal";
import { AwsDetailModal } from "@/components/portal/AwsDetailModal";

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
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <NongJiffyAvatar size="md" className="h-8 w-8 mt-0.5" />
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
                      {m.content ? (
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
                          {autoLinkBrAndCitations(m.content)}
                        </ReactMarkdown>
                      ) : (
                        <span className="inline-block animate-pulse text-slate-400 text-xs">
                          กำลังประมวลผลคำตอบ...
                        </span>
                      )}
                    </div>
                  )}

                  {!isUser && m.content && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="absolute right-2 top-2 hidden rounded-md border border-slate-200 bg-white p-1 text-slate-400 opacity-0 transition-opacity hover:text-slate-700 group-hover:flex group-hover:opacity-100"
                      title="คัดลอกข้อความ"
                    >
                      {copiedId === m.id ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white shadow-sm mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
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
