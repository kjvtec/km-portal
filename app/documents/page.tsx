import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  Upload,
  PlusCircle,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DocumentItem {
  id: string;
  title: string;
  file_type: string;
  created_at: string;
  content: string;
  metadata: Record<string, unknown>;
}

async function getDocuments(): Promise<DocumentItem[]> {
  try {
    const supabase = getServiceSupabase();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("documents")
      .select("id, title, file_type, created_at, content, metadata")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return [];
    }

    return (data as DocumentItem[]) || [];
  } catch (err) {
    console.warn("Supabase not connected or configured yet:", err);
    return [];
  }
}

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span>คลังเอกสารและคู่มือระบบ (Knowledge Documents)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            รายการเอกสาร ข้อกำหนดระบบ และคู่มือสถาปัตยกรรมที่จัดเก็บในระบบ Supabase pgvector
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/documents/new"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <PlusCircle className="h-4 w-4" />
            <span>เขียนบทความใหม่</span>
          </Link>
          <Link
            href="/documents/upload"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            <span>อัปโหลดเอกสาร</span>
          </Link>
        </div>
      </div>

      {/* Document Grid */}
      {documents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            ยังไม่มีเอกสารในระบบ หรือยังไม่ได้ตั้งค่า Supabase
          </h3>
          <p className="max-w-md mx-auto text-xs text-slate-500 mb-6">
            คุณสามารถกดปุ่ม Seed เพื่อนำเข้าข้อมูล <code>PROJECT_KNOWLEDGE_BASE_VTEC_RETAIL.md</code> หรืออัปโหลดไฟล์เอกสารใหม่
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              ไปที่หน้าหลักเพื่อกด Seed
            </Link>
            <Link
              href="/documents/upload"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              อัปโหลดไฟล์
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const previewText = doc.content
              ? doc.content.replace(/[#*`\n]/g, " ").slice(0, 140) + "..."
              : "ไม่มีเนื้อหาตัวอย่าง";

            return (
              <div
                key={doc.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                      {doc.file_type}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(doc.created_at)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {previewText}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>เปิดอ่านเอกสาร</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>ถาม AI</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
