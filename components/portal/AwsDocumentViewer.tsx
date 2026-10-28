"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cloud,
  FileText,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Share2,
  Server,
  ShieldCheck,
  ChevronRight,
  Database,
  Lock,
  Network,
} from "lucide-react";
import { getAwsDetail } from "@/lib/aws-details";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface AwsDocumentViewerProps {
  content: string;
}

export function AwsDocumentViewer({ content }: AwsDocumentViewerProps) {
  const [activeTab, setActiveTab] = useState<"doc" | "pdf">("doc");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [targetPage, setTargetPage] = useState<number>(1);
  const [targetSec, setTargetSec] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const secParam = params.get("sec");
      const pageParam = params.get("page");
      const tabParam = params.get("tab");

      if (tabParam === "pdf") {
        setActiveTab("pdf");
      }

      if (secParam) {
        setTargetSec(secParam);
        const detail = getAwsDetail(secParam);
        if (detail) {
          setTargetPage(detail.page);
        }
      } else if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (p >= 1 && p <= 6) {
          setTargetPage(p);
        }
      }
    }
  }, []);

  const pdfUrl = `/docs/PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf#page=${targetPage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
          <span>หน้าหลัก KM Portal</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <Link href="/documents" className="hover:text-blue-600 transition-colors">
          <span>คลังเอกสาร</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
          AWS DEV Resource Summary (v1.5)
        </span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm font-semibold">
              <Cloud className="h-3.5 w-3.5 text-slate-950" />
              <span>AWS Cloud Infrastructure</span>
            </span>
            <span className="text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-1 rounded-lg">
              Region: ap-southeast-7 (Bangkok)
            </span>
            <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
              DEV Environment v1.5
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>DailiTech (26 Oct 2026)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
            รายงานสรุปทรัพยากรระบบ AWS (ฉบับภาษาไทยโดยละเอียด)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            โครงการ <strong>PTTRM VTEC JIFFY POS</strong> — สภาพแวดล้อมเพื่อการพัฒนา (DEV Environment) 
            ครอบคลุมสถาปัตยกรรม Multi-Account, EKS Cluster (k8s v1.35), Aurora PostgreSQL 17.5, ElastiCache Redis 7.1, 
            CloudFront CDN, AWS WAF, และคู่มือเชื่อมต่อ OpenVPN
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/?q=${encodeURIComponent("สรุปสถาปัตยกรรม AWS Multi-Account และการเชื่อมต่อ EKS ในระบบ PTTRM VTEC POS")}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>ถาม AI เกี่ยวกับ AWS ระบบนี้</span>
            </Link>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <FileText className="h-4 w-4 text-amber-400" />
              <span>เปิดไฟล์ PDF ต้นฉบับ</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "คัดลอกเนื้อหาแล้ว" : "คัดลอกเนื้อหา"}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "คัดลอกลิงก์แล้ว" : "แชร์"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spec Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Server className="h-4 w-4 text-blue-600" />
            <span className="text-[11px] font-semibold">Container Runtime</span>
          </div>
          <div className="text-sm font-bold text-slate-900">EKS vtechq-eks-dev</div>
          <div className="text-[11px] text-slate-500">k8s v1.35 (Node m6i.large)</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Database className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-semibold">Database & Cache</span>
          </div>
          <div className="text-sm font-bold text-slate-900">Aurora PG 17.5 & Redis 7.1</div>
          <div className="text-[11px] text-slate-500">Port 5432 & 6379 (Single AZ)</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Network className="h-4 w-4 text-cyan-600" />
            <span className="text-[11px] font-semibold">Network & Edge</span>
          </div>
          <div className="text-sm font-bold text-slate-900">CloudFront + ALB + WAF</div>
          <div className="text-[11px] text-slate-500">ras-dev.pttrm.com</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Lock className="h-4 w-4 text-amber-600" />
            <span className="text-[11px] font-semibold">Remote Access</span>
          </div>
          <div className="text-sm font-bold text-slate-900">OpenVPN Non-Prod</div>
          <div className="text-[11px] text-slate-500">SNAT: 172.28.0.138/32</div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("doc")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "doc"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            เนื้อหาคู่มือและสถาปัตยกรรม (ฉบับภาษาไทย)
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pdf"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>เอกสาร PDF ฉบับจริง (หน้า {targetPage} จาก 6 หน้า)</span>
          </button>
        </div>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>เปิด PDF แท็บใหม่</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Main Content Area */}
      {activeTab === "doc" ? (
        <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <MarkdownRenderer content={content} />
        </article>
      ) : (
        <div className="rounded-3xl border border-slate-300 bg-white overflow-hidden shadow-sm h-[800px] flex flex-col">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>เอกสาร PDF ต้นฉบับ: PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf</span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>ขยายดูเต็มจอ</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <iframe
            src={pdfUrl}
            className="w-full flex-1 border-0"
            title="AWS DEV Resource Summary PDF"
          />
        </div>
      )}
    </div>
  );
}
