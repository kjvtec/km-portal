"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Database,
} from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    documentId?: string;
    chunkCount?: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);
      if (title.trim()) {
        formData.append("title", title.trim());
      }

      const res = await fetch("/api/documents/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult({
          success: true,
          message: data.message || `นำเข้าสำเร็จ ${data.chunkCount} Chunks`,
          documentId: data.documentId,
          chunkCount: data.chunkCount,
        });
        setFile(null);
        setTitle("");
      } else {
        setResult({
          success: false,
          message: data.error || "เกิดข้อผิดพลาดในการประมวลผลไฟล์",
        });
      }
    } catch (err: unknown) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          อัปโหลดและนำเข้าเอกสารใหม่ (Document Ingestion)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          รองรับไฟล์ Markdown (.md), PDF (.pdf), Word (.docx) และ Text (.txt) โดยระบบจะทำการตัดแบ่งเนื้อหา (Chunking) และสร้าง Vector Embeddings ให้อัตโนมัติ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Main Upload Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
          >
            {/* File Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                เลือกไฟล์เอกสาร (File Selection)
              </label>
              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/30">
                <input
                  type="file"
                  accept=".md,.pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ขนาด: {(file.size / 1024).toFixed(1)} KB • คลิกเพื่อเปลี่ยนไฟล์
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      รองรับ Markdown (.md), PDF (.pdf), Word (.docx), ข้อความ (.txt)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                ชื่อเอกสาร (Document Title)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ระบุชื่อหรือหัวข้อเอกสาร..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Target Workspace */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Workspace ปลายทาง
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                <span>JFFPOS Retail (PTTRM)</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !file}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all shadow-sm ${
                uploading || !file
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>กำลังแปลงไฟล์และสร้าง Vector Embeddings...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>อัปโหลดและประมวลผลเข้าสู่ฐานข้อมูล</span>
                </>
              )}
            </button>

            {/* Result Alert */}
            {result && (
              <div
                className={`rounded-xl p-4 text-xs font-medium flex items-start gap-2.5 ${
                  result.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{result.message}</p>
                  {result.success && result.documentId && (
                    <div className="mt-2 flex items-center gap-3">
                      <Link
                        href={`/documents/${result.documentId}`}
                        className="text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>เปิดดูเอกสารที่สร้าง</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                      <Link
                        href="/chat"
                        className="text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>ทดลองแชตสอบถาม AI</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar Info & Quick Seed */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span>การประมวลผลข้อมูล (Pipeline)</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span><strong>1. Parse:</strong> สกัดข้อความดิบจากไฟล์ .md, .pdf หรือ .docx</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span><strong>2. Chunk:</strong> แบ่งเนื้อหาเป็นส่วนย่อย ~1,000 ตัวอักษรพร้อม Overlap 150 ตัวอักษร</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span><strong>3. Embed:</strong> ส่งเข้า OpenAI text-embedding-3-small สร้าง 1536 มิติ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span><strong>4. Index:</strong> บันทึกลง Supabase PostgreSQL พร้อม HNSW Index</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-blue-900 mb-1">
              ต้องการเขียนบทความเอง?
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              สามารถใช้งานหน้า Markdown Editor ในตัวเพื่อพิมพ์จัดทำข้อกำหนดหรือบันทึกใหม่ได้ทันที
            </p>
            <Link
              href="/documents/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>ไปที่หน้าเขียนบทความ Markdown</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
