import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getDocument(id: string) {
  try {
    const supabase = getServiceSupabase();
    if (!supabase) return null;

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*, workspaces(name, slug)")
      .eq("id", id)
      .single();

    if (docError || !doc) {
      return null;
    }

    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("id, chunk_index, token_count")
      .eq("document_id", id)
      .order("chunk_index", { ascending: true });

    return {
      ...doc,
      chunks: chunks || [],
    };
  } catch (err) {
    console.error("Error fetching document:", err);
    return null;
  }
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const doc = await getDocument(id);

  if (!doc) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปคลังเอกสาร</span>
        </Link>

        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>ถาม-ตอบ AI เกี่ยวกับเอกสารนี้</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Document Content */}
        <div className="lg:col-span-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
            <div className="border-b border-slate-200 pb-6 mb-6">
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 uppercase">
                {doc.file_type}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 leading-tight">
                {doc.title}
              </h1>
            </div>

            {/* Markdown Body */}
            <div className="prose prose-slate max-w-none text-sm leading-relaxed prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-table:text-xs">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {doc.content || "ไม่มีเนื้อหาในเอกสารฉบับนี้"}
              </ReactMarkdown>
            </div>
          </article>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              ข้อมูลเอกสาร (Metadata)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400">Workspace:</p>
                <p className="font-semibold text-slate-800">
                  {doc.workspaces?.name || "JFFPOS Retail (PTTRM)"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">วันที่สร้าง:</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDate(doc.created_at)}</span>
                </p>
              </div>

              <div>
                <p className="text-slate-400">จำนวน Chunks:</p>
                <p className="font-semibold text-blue-600 flex items-center gap-1.5 mt-0.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{doc.chunks?.length || 0} ชิ้น (Vectorized)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 mb-2">Vector Chunks Overview</h4>
            <p className="leading-relaxed">
              เอกสารฉบับนี้ถูกตัดแบ่งเป็น {doc.chunks?.length || 0} Chunks และฝัง Vector Embeddings ขนาด 1,536 มิติพร้อมใช้งานในระบบ RAG Chat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
