"use client";

import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, User, Cloud } from "lucide-react";
import { NongJiffyAvatar } from "@/components/ui/NongJiffyAvatar";
import { autoLinkBrAndCitations } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  isCopied: boolean;
  onCopy: (id: string, text: string) => void;
  onSelectBr: (code: string) => void;
  onSelectAws: (code: string) => void;
  avatarClassName?: string;
  userAvatarSize?: "sm" | "md";
}

/**
 * Pure, memoized chat bubble component.
 * Ensures that streaming tokens only re-render the single active message,
 * drastically reducing DOM reconciliation time across long conversation histories.
 */
export const ChatMessageBubble = memo(function ChatMessageBubble({
  msg,
  isCopied,
  onCopy,
  onSelectBr,
  onSelectAws,
  avatarClassName = "h-9 w-9",
  userAvatarSize = "md",
}: ChatMessageBubbleProps) {
  const isUser = msg.role === "user";

  const linkedContent = useMemo(() => {
    return isUser ? msg.content : autoLinkBrAndCitations(msg.content);
  }, [isUser, msg.content]);

  return (
    <div className={`flex gap-3 sm:gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="shrink-0 mt-0.5">
          <NongJiffyAvatar
            size="md"
            className={`${avatarClassName} shadow-sm ring-2 ring-blue-500/20`}
          />
        </div>
      )}

      <div
        className={`relative group max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs"
            : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        ) : (
          <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
            {msg.content ? (
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
                              onSelectBr(code);
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
                      const secParam = href?.match(/sec=([^&]+)/);
                      if (secParam) {
                        targetCode = secParam[1].toUpperCase();
                      } else if (typeof children === "string") {
                        const codeMatch = children.match(/AWS-(?:\d{2}(?:\.\d)?|[A-Za-z]+)/i);
                        if (codeMatch) targetCode = codeMatch[0].toUpperCase();
                      }

                      return (
                        <a
                          href={`/documents/aws?sec=${targetCode}`}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                              e.preventDefault();
                              onSelectAws(targetCode);
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
                {linkedContent}
              </ReactMarkdown>
            ) : (
              <span className="inline-block animate-pulse text-slate-400 text-xs">
                กำลังประมวลผลคำตอบ...
              </span>
            )}
          </div>
        )}

        {!isUser && msg.content && (
          <button
            onClick={() => onCopy(msg.id, msg.content)}
            className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100 transition-all cursor-pointer"
            title="คัดลอกข้อความ"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {isUser && (
        <div
          className={`${
            userAvatarSize === "sm" ? "h-8 w-8" : "h-9 w-9 sm:h-10 sm:w-10"
          } rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5`}
        >
          <User className={userAvatarSize === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        </div>
      )}
    </div>
  );
});
