"use client";

import React, { useState, memo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  Copy,
  Terminal,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  stripLeadingHeading?: boolean;
}

/**
 * Static component map hoisted outside render cycle to avoid recreation
 */
const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200 tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200 flex items-center gap-2 tracking-tight">
      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
      <span>{children}</span>
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-5 mb-2.5 flex items-center gap-2">
      <ChevronRight className="h-4 w-4 text-amber-500 shrink-0" />
      <span>{children}</span>
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mt-3 mb-1.5 uppercase tracking-wider">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-sm text-slate-700 leading-relaxed my-2">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-slate-900">
      {children}
    </strong>
  ),
  ol: ({ children }) => {
    let stepCount = 0;
    return (
      <ol className="my-3 space-y-2.5 list-none pl-0">
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
    <ul className="my-3 space-y-2 list-none pl-0">
      {children}
    </ul>
  ),
  li: (props: any) => {
    const isOrdered = props["data-ordered"] === true;
    const stepNumber = props["data-step"] || 1;

    if (isOrdered) {
      return (
        <li className="flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all my-2">
          <span className="h-7 w-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5 font-mono">
            {String(stepNumber).padStart(2, "0")}
          </span>
          <div className="flex-1 text-sm text-slate-800 leading-relaxed font-normal">
            {props.children}
          </div>
        </li>
      );
    }

    return (
      <li className="flex items-start gap-2.5 pl-1 my-2 text-sm text-slate-700 leading-relaxed">
        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-2" />
        <div className="flex-1 font-normal text-slate-800">
          {props.children}
        </div>
      </li>
    );
  },
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs bg-white">
      <table className="w-full text-xs text-left border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-100/90 text-slate-800 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-slate-100">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-slate-50/80 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-3.5 py-3 font-bold text-slate-800 border-r border-slate-200 last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }) => {
    const textContent = String(children);
    const isPass = textContent.trim() === "PASS" || textContent.includes("PASS");
    const isFail = textContent.trim() === "FAIL";

    return (
      <td className="px-3.5 py-2.5 text-slate-700 border-r border-slate-100 last:border-r-0 leading-relaxed align-top">
        {isPass ? (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>PASS</span>
          </span>
        ) : isFail ? (
          <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full text-[11px]">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            <span>FAIL</span>
          </span>
        ) : (
          children
        )}
      </td>
    );
  },
  code: ({ node, className, children, ...props }: any) => {
    const isMultiLine = String(children).includes("\n");
    if (!isMultiLine) {
      return (
        <code
          className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-indigo-700 border border-slate-200 selection:bg-indigo-100"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <CodeBlock code={String(children).replace(/\n$/, "")}>
        {children}
      </CodeBlock>
    );
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-amber-500 bg-amber-50/70 p-3.5 rounded-r-xl text-amber-950 text-xs sm:text-sm font-medium leading-relaxed">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 inline-flex items-center gap-0.5"
    >
      <span>{children}</span>
      <ExternalLink className="h-3 w-3 inline shrink-0" />
    </a>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
};

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className = "",
  stripLeadingHeading = false,
}: MarkdownRendererProps) {
  let processedContent = content;

  // Optionally strip redundant first markdown heading (e.g. "## 2. แผนผังสถาปัตยกรรม...")
  if (stripLeadingHeading) {
    processedContent = processedContent.replace(/^#{1,3}\s+[^\n]+\n+/, "");
  }

  return (
    <div className={`markdown-body space-y-4 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MARKDOWN_COMPONENTS}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});

/**
 * Multi-line code block with Terminal header and copy button
 */
const CodeBlock = memo(function CodeBlock({ code, children }: { code: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-mono font-medium">Terminal / CLI Command</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-300">คัดลอกแล้ว</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-400" />
              <span>คัดลอก</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed selection:bg-amber-500/30">
        {children}
      </pre>
    </div>
  );
});
