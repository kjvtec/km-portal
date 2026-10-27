import fs from "fs";
import { PDFParse } from "pdf-parse";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cnzthrnkyumhgsomszwu.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuenRocm5reXVtaGdzb21zend1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjExODAyNCwiZXhwIjoyMTA3Njk0MDI0fQ.nXRVNOCjmlQGQe_xYGPX2TB0ezyrT4nIwIT64iYlPDQ";

const supabase = createClient(supabaseUrl, serviceKey);

const PDF_PATH = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";

async function run() {
  console.log("=== 1. Reading & Parsing PDF ===");
  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Loaded PDF (${(buffer.length / (1024 * 1024)).toFixed(1)} MB)`);

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const rawText = result.text;
  console.log(`Total raw text length: ${rawText.length} characters`);

  // Split by page marker: "-- X of 1004 --"
  const rawPages = rawText.split(/-- \d+ of \d+ --/);
  console.log(`Total raw pages split: ${rawPages.length}`);

  // Clean pages & assign Business Areas
  const chunks = [];
  let currentBA = "Overview";
  let chunkIdx = 0;

  for (let i = 1; i < rawPages.length; i++) {
    const pageNum = i;
    let pageContent = rawPages[i].trim();

    // Clean standard repeating header
    pageContent = pageContent
      .replace(/Design Specification Document \(DSD\)/gi, "")
      .replace(/JIFFY RETAIL POS Replacement Project for PTTRM/gi, "")
      .replace(/PTT Retail Management Company Limited: Strictly Confidential Page \d+ of \d+/gi, "")
      .replace(/Author :[^\n]*\n/gi, "")
      .trim();

    // Detect Business Area header if present
    const baMatch = pageContent.match(/BA-\d{2}[^\n\r]+/);
    if (baMatch) {
      currentBA = baMatch[0].trim();
    } else {
      const chapterMatch = pageContent.match(/CHAPTER [A-Z][^\n\r]+/);
      if (chapterMatch) {
        currentBA = chapterMatch[0].trim();
      }
    }

    if (pageContent.length < 30) {
      continue; // Skip almost empty pages (e.g. blank divider)
    }

    // Split overly long pages if any (> 2500 chars)
    if (pageContent.length > 2500) {
      const half = Math.floor(pageContent.length / 2);
      const splitIdx = pageContent.indexOf("\n", half);
      const part1 = pageContent.slice(0, splitIdx > 0 ? splitIdx : half).trim();
      const part2 = pageContent.slice(splitIdx > 0 ? splitIdx : half).trim();

      chunks.push({
        pageNum,
        ba: currentBA,
        content: `[เอกสาร DSD PTTRM JIFFY RETAIL V1.0 | หน้า ${pageNum}/1004 | หมวด: ${currentBA} (ตอนที่ 1)]\n${part1}`,
      });
      chunks.push({
        pageNum,
        ba: currentBA,
        content: `[เอกสาร DSD PTTRM JIFFY RETAIL V1.0 | หน้า ${pageNum}/1004 | หมวด: ${currentBA} (ตอนที่ 2)]\n${part2}`,
      });
    } else {
      chunks.push({
        pageNum,
        ba: currentBA,
        content: `[เอกสาร DSD PTTRM JIFFY RETAIL V1.0 | หน้า ${pageNum}/1004 | หมวด: ${currentBA}]\n${pageContent}`,
      });
    }
  }

  console.log(`Generated ${chunks.length} clean chunks.`);

  // Sample chunk preview
  console.log("\n--- Preview Chunk 35 ---");
  console.log(chunks[35]?.content.slice(0, 300));
  console.log("\n--- Preview Chunk 500 ---");
  console.log(chunks[500]?.content.slice(0, 300));

  console.log("\n=== 2. Purging Old BA06 Data from Supabase ===");
  // Delete all existing chunks
  const { error: delChunksErr } = await supabase.from("document_chunks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delChunksErr) console.warn("Delete chunks warning:", delChunksErr);
  else console.log("Deleted all previous document chunks.");

  // Delete all existing documents
  const { error: delDocsErr } = await supabase.from("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delDocsErr) console.warn("Delete docs warning:", delDocsErr);
  else console.log("Deleted all previous documents.");

  console.log("\n=== 3. Creating Master Document Record ===");
  const workspaceId = "4029f3e9-d7c7-4acb-9147-6a4fac6c840a";
  const docTitle = "DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed (1,004 หน้า)";

  const { data: newDoc, error: docErr } = await supabase
    .from("documents")
    .insert({
      workspace_id: workspaceId,
      title: docTitle,
      file_type: "pdf",
      content: rawText.slice(0, 50000), // Store overview & TOC in document table
      metadata: {
        source: "DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf",
        signedDate: "2026-09-28",
        totalPages: 1004,
        totalCharacters: rawText.length,
        totalChunks: chunks.length,
      },
    })
    .select("id")
    .single();

  if (docErr) throw docErr;
  console.log("Created Document ID:", newDoc.id);

  console.log("\n=== 4. Inserting Chunks into Supabase ===");
  const dbRecords = chunks.map((c, index) => ({
    document_id: newDoc.id,
    workspace_id: workspaceId,
    chunk_index: index,
    content: c.content,
    token_count: Math.ceil(c.content.length / 4),
  }));

  const BATCH_SIZE = 50;
  for (let b = 0; b < dbRecords.length; b += BATCH_SIZE) {
    const batch = dbRecords.slice(b, b + BATCH_SIZE);
    const { error: batchErr } = await supabase.from("document_chunks").insert(batch);
    if (batchErr) {
      console.error(`Error at batch ${b}-${b + BATCH_SIZE}:`, batchErr);
      throw batchErr;
    }
    process.stdout.write(`Inserted ${Math.min(b + BATCH_SIZE, dbRecords.length)} / ${dbRecords.length} chunks\r`);
  }

  console.log(`\nSUCCESS! Inserted all ${dbRecords.length} chunks from DSD Signed PDF into Supabase!`);
}

run().catch(console.error);
