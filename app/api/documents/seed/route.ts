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

    // 5. Also seed AWS DEV Resource Summary if exists
    let awsChunkCount = 0;
    const awsChunksPath = path.join(process.cwd(), "data", "aws-dev-chunks.json");
    const awsMdPath = path.join(process.cwd(), "data", "aws-dev-resource-summary.md");

    if (fs.existsSync(awsChunksPath) && fs.existsSync(awsMdPath)) {
      const awsChunks = JSON.parse(fs.readFileSync(awsChunksPath, "utf-8")) as Array<{
        title: string;
        content: string;
      }>;
      const awsMd = fs.readFileSync(awsMdPath, "utf-8");
      const awsTitle = "PTTRM VTEC JIFFY POS — รายงานสรุปทรัพยากรระบบ AWS DEV v1.5 (DailiTech)";

      const { data: existingAwsDoc } = await supabase
        .from("documents")
        .select("id")
        .eq("workspace_id", workspaceId)
        .ilike("title", "%AWS DEV%")
        .single();

      let awsDocId = existingAwsDoc?.id;
      if (awsDocId) {
        await supabase.from("document_chunks").delete().eq("document_id", awsDocId);
        await supabase
          .from("documents")
          .update({
            title: awsTitle,
            content: awsMd,
            file_type: "pdf",
            metadata: {
              source: "PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf",
              pdfUrl: "/docs/PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf",
              author: "DailiTech Co., Ltd. (AWS Advanced Consulting Partner)",
              version: "1.5",
              date: "2026-10-26",
              environment: "DEV",
              region: "ap-southeast-7 (Bangkok)",
              totalPages: 6,
              totalChunks: awsChunks.length,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", awsDocId);
      } else {
        const { data: newAwsDoc } = await supabase
          .from("documents")
          .insert({
            workspace_id: workspaceId,
            title: awsTitle,
            file_type: "pdf",
            content: awsMd,
            metadata: {
              source: "PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf",
              pdfUrl: "/docs/PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf",
              author: "DailiTech Co., Ltd. (AWS Advanced Consulting Partner)",
              version: "1.5",
              date: "2026-10-26",
              environment: "DEV",
              region: "ap-southeast-7 (Bangkok)",
              totalPages: 6,
              totalChunks: awsChunks.length,
            },
          })
          .select("id")
          .single();
        awsDocId = newAwsDoc?.id;
      }

      if (awsDocId) {
        const awsRecords = awsChunks.map((c, index) => ({
          document_id: awsDocId,
          workspace_id: workspaceId,
          chunk_index: index,
          content: c.content,
          token_count: Math.ceil(c.content.length / 4),
        }));
        await supabase.from("document_chunks").insert(awsRecords);
        awsChunkCount = awsChunks.length;
      }
    }

    return NextResponse.json({
      success: true,
      workspaceId,
      documentId,
      title,
      chunkCount: rawChunks.length + awsChunkCount,
      message: `นำเข้าข้อมูล DSD ฉบับทางการ (${rawChunks.length} Chunks) และเอกสาร AWS DEV (${awsChunkCount} Chunks) สำเร็จ!`,
    });
  } catch (error: unknown) {
    console.error("Seeding error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
