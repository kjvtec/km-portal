"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("กรุณาระบุทั้งชื่อเอกสารและเนื้อหาบทความ");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch("/api/documents/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          fileType: "markdown",
          metadata: {
            author: "KM Web Editor",
            createdAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/documents/${data.documentId}`);
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการบันทึกเอกสาร");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ยกเลิกและกลับไปคลังเอกสาร</span>
        </Link>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "edit"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>แก้ไข (Markdown)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "preview"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>ดูตัวอย่าง (Preview)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ตั้งชื่อเอกสารหรือคู่มือระบบ..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-lg font-bold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Editor or Preview Pane */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {activeTab === "edit" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# หัวข้อเอกสาร&#10;&#10;พิมพ์เนื้อหาคู่มือ ข้อกำหนดทางธุรกิจ หรือบันทึกการทำงานในรูปแบบ Markdown ที่นี่..."
              rows={20}
              className="w-full p-6 text-sm font-mono text-slate-800 focus:outline-none resize-y"
            />
          ) : (
            <div className="p-8 prose prose-slate max-w-none text-sm min-h-[500px]">
              {content.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-slate-400 italic">ยังไม่มีเนื้อหาให้แสดงตัวอย่าง</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/documents"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold transition-all shadow-sm ${
              saving || !title.trim() || !content.trim()
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>กำลังบันทึกและสร้าง Embeddings...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>บันทึกและตัด Chunk ลงระบบ RAG</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
