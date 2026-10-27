import { NextRequest, NextResponse } from "next/server";
import { requireServiceSupabase } from "@/lib/supabase/admin";
import { chunkText } from "@/lib/ai/chunker";
import { generateBatchEmbeddings } from "@/lib/ai/embedding";
import mammoth from "mammoth";

export const maxDuration = 60; // Allow 60s for file processing

export async function POST(req: NextRequest) {
  try {
    const supabase = requireServiceSupabase();
    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let content = "";
    let fileType = "markdown";
    let workspaceId: string | undefined;
    let metadata: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      workspaceId = (formData.get("workspaceId") as string) || undefined;
      const customTitle = formData.get("title") as string | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      title = customTitle?.trim() || file.name;
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (extension === "pdf") {
        fileType = "pdf";
        try {
          const { PDFParse } = await import("pdf-parse");
          const parser = new PDFParse({ data: buffer });
          const parsed = await parser.getText();
          await parser.destroy();
          content = parsed.text;
        } catch (pdfErr) {
          console.error("PDF parse error:", pdfErr);
          return NextResponse.json(
            { error: "Failed to extract text from PDF file" },
            { status: 422 }
          );
        }
      } else if (extension === "docx") {
        fileType = "docx";
        try {
          const result = await mammoth.extractRawText({ buffer });
          content = result.value;
        } catch (docxErr) {
          console.error("DOCX parse error:", docxErr);
          return NextResponse.json(
            { error: "Failed to extract text from DOCX file" },
            { status: 422 }
          );
        }
      } else if (["md", "markdown", "txt"].includes(extension)) {
        fileType = extension.startsWith("md") ? "markdown" : "text";
        content = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: `Unsupported file extension .${extension}. Please use PDF, DOCX, MD, or TXT.` },
          { status: 400 }
        );
      }

      metadata = {
        originalFilename: file.name,
        fileSizeBytes: file.size,
        fileExtension: extension,
      };
    } else {
      // JSON body
      const body = await req.json();
      title = body.title;
      content = body.content;
      fileType = body.fileType || "markdown";
      workspaceId = body.workspaceId;
      metadata = body.metadata || {};
    }

    if (!title || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Title and content cannot be empty" },
        { status: 400 }
      );
    }

    // If workspaceId is not provided, look up the default JFFPOS workspace
    if (!workspaceId) {
      const { data: defaultWs } = await supabase
        .from("workspaces")
        .select("id")
        .eq("slug", "jffpos")
        .single();

      if (defaultWs) {
        workspaceId = defaultWs.id;
      }
    }

    // 1. Insert Document record
    const { data: docData, error: docError } = await supabase
      .from("documents")
      .insert({
        workspace_id: workspaceId || null,
        title,
        file_type: fileType,
        content,
        metadata,
      })
      .select("id")
      .single();

    if (docError || !docData) {
      console.error("Document insert error:", docError);
      return NextResponse.json(
        { error: "Failed to create document record", details: docError },
        { status: 500 }
      );
    }

    const documentId = docData.id;

    // 2. Chunk text
    const chunks = chunkText(content, { maxChunkSize: 1000, overlapSize: 150 });

    if (chunks.length === 0) {
      return NextResponse.json({
        success: true,
        documentId,
        chunkCount: 0,
        message: "Document created with no chunks",
      });
    }

    // 3. Generate Vector Embeddings if OPENAI_API_KEY is configured
    let embeddings: (number[] | null)[] = new Array(chunks.length).fill(null);
    if (process.env.OPENAI_API_KEY) {
      try {
        const chunkTexts = chunks.map((c) => c.content);
        embeddings = await generateBatchEmbeddings(chunkTexts);
      } catch (embErr) {
        console.warn("Embedding error, continuing without embeddings:", embErr);
      }
    }

    // 4. Insert Chunks into Supabase
    const chunkRecords = chunks.map((chunk, index) => ({
      document_id: documentId,
      workspace_id: workspaceId || null,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      token_count: chunk.tokenCount,
      embedding: embeddings[index] || null,
    }));

    for (let b = 0; b < chunkRecords.length; b += 25) {
      const batch = chunkRecords.slice(b, b + 25);
      const { error: chunkError } = await supabase
        .from("document_chunks")
        .insert(batch);

      if (chunkError) {
        console.error("Chunk insert error:", chunkError);
        return NextResponse.json(
          { error: "Failed to store document chunks", details: chunkError },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      documentId,
      title,
      chunkCount: chunks.length,
      hasEmbeddings: Boolean(embeddings[0]),
      message: `Successfully processed ${chunks.length} chunks.`,
    });
  } catch (error: unknown) {
    console.error("Ingestion error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
