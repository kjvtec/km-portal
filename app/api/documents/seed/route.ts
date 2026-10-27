import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireServiceSupabase } from "@/lib/supabase/admin";

export const maxDuration = 60; // Allow 60s for seeding

export async function POST() {
  try {
    const supabase = requireServiceSupabase();

    const filePath = path.join(process.cwd(), "data", "dsd-signed-chunks.json");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `DSD chunks data file not found at: ${filePath}` },
        { status: 404 }
      );
    }

    const rawChunks = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Array<{
      pageNum: number;
      ba: string;
      content: string;
    }>;

    const title = "DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed (1,004 หน้า)";

    // 1. Ensure JFFPOS Workspace exists
    let { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("slug", "jffpos")
      .single();

    if (!workspace) {
      const { data: newWs, error: wsError } = await supabase
        .from("workspaces")
        .insert({
          name: "JFFPOS Retail (PTTRM)",
          slug: "jffpos",
          description:
            "ระบบ POS Vtec Retail & บริหารสินค้าคงคลังร้านสะดวกซื้อ Jiffy (DSD BA01 - BA09)",
        })
        .select("id")
        .single();

      if (wsError || !newWs) {
        throw new Error(`Failed to create workspace: ${wsError?.message}`);
      }
      workspace = newWs;
    }

    const workspaceId = workspace.id;

    // 2. Clean out old legacy BA06 documents if any
    const { data: oldDocs } = await supabase
      .from("documents")
      .select("id")
      .ilike("title", "%BA06%");

    if (oldDocs && oldDocs.length > 0) {
      for (const d of oldDocs) {
        await supabase.from("document_chunks").delete().eq("document_id", d.id);
        await supabase.from("documents").delete().eq("id", d.id);
      }
    }

    // 3. Check or Create Master Document Record
    let { data: existingDoc } = await supabase
      .from("documents")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("title", title)
      .single();

    let documentId = existingDoc?.id;

    if (documentId) {
      // Clean existing chunks to re-seed cleanly
      await supabase.from("document_chunks").delete().eq("document_id", documentId);
    } else {
      const { data: newDoc, error: docError } = await supabase
        .from("documents")
        .insert({
          workspace_id: workspaceId,
          title,
          file_type: "pdf",
          content: "DSD PTTRM JIFFY RETAIL V1.0 (Signed 28 Sep 2026 ฉบับทางการ 1,004 หน้า ครอบคลุม BA-01 ถึง BA-09)",
          metadata: {
            source: "DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf",
            signedDate: "2026-09-28",
            totalPages: 1004,
            totalChunks: rawChunks.length,
          },
        })
        .select("id")
        .single();

      if (docError || !newDoc) {
        throw new Error(`Failed to insert document: ${docError?.message}`);
      }
      documentId = newDoc.id;
    }

    // 4. Insert 977 chunks in batches of 50
    const chunkRecords = rawChunks.map((chunk, index) => ({
      document_id: documentId,
      workspace_id: workspaceId,
      chunk_index: index,
      content: chunk.content,
      token_count: Math.ceil(chunk.content.length / 4),
    }));

    const BATCH_SIZE = 50;
    for (let b = 0; b < chunkRecords.length; b += BATCH_SIZE) {
      const batch = chunkRecords.slice(b, b + BATCH_SIZE);
      const { error: chunkError } = await supabase
        .from("document_chunks")
        .insert(batch);

      if (chunkError) {
        throw new Error(`Failed to insert chunks at batch ${b}: ${chunkError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      workspaceId,
      documentId,
      title,
      chunkCount: rawChunks.length,
      message: `นำเข้าข้อมูล DSD ฉบับทางการสำเร็จ! รวม ${rawChunks.length} Chunks (1,004 หน้า BA-01 ถึง BA-09)`,
    });
  } catch (error: unknown) {
    console.error("Seeding error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
