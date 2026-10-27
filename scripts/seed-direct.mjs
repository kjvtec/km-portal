import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = "https://cnzthrnkyumhgsomszwu.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuenRocm5reXVtaGdzb21zend1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjExODAyNCwiZXhwIjoyMTA3Njk0MDI0fQ.nXRVNOCjmlQGQe_xYGPX2TB0ezyrT4nIwIT64iYlPDQ";

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const filePath = path.join(process.cwd(), "data", "seed-knowledge-base.md");
  const content = fs.readFileSync(filePath, "utf-8");
  const title = "Project Memory & Knowledge Base: ระบบ POS Vtec Retail (DSD BA06)";

  const workspaceId = "4029f3e9-d7c7-4acb-9147-6a4fac6c840a";

  // Check or Insert document
  const { data: existingDoc } = await supabase
    .from("documents")
    .select("id")
    .eq("title", title)
    .single();

  let docId = existingDoc?.id;

  if (docId) {
    console.log("Document already exists, updating:", docId);
    await supabase.from("document_chunks").delete().eq("document_id", docId);
    await supabase.from("documents").update({ content }).eq("id", docId);
  } else {
    const { data: newDoc, error: docErr } = await supabase
      .from("documents")
      .insert({
        workspace_id: workspaceId,
        title,
        file_type: "markdown",
        content,
        metadata: { source: "DSD BA06 V2.0" },
      })
      .select("id")
      .single();

    if (docErr) throw docErr;
    docId = newDoc.id;
    console.log("Created Document ID:", docId);
  }

  // Chunks
  const sections = content.split(/(?=\n#{1,3}\s)/g);
  const chunks = [];
  let chunkIdx = 0;

  for (const s of sections) {
    const clean = s.trim();
    if (!clean) continue;

    for (let j = 0; j < clean.length; j += 850) {
      const part = clean.slice(j, j + 1000);
      chunks.push({
        document_id: docId,
        workspace_id: workspaceId,
        chunk_index: chunkIdx++,
        content: part,
        token_count: Math.ceil(part.length / 4),
      });
    }
  }

  console.log(`Inserting ${chunks.length} chunks...`);

  // Insert in batches of 25
  for (let b = 0; b < chunks.length; b += 25) {
    const batch = chunks.slice(b, b + 25);
    const { error: chunkErr } = await supabase.from("document_chunks").insert(batch);
    if (chunkErr) {
      console.error("Batch insert error:", chunkErr);
      throw chunkErr;
    }
  }

  console.log(`SUCCESS! Inserted ${chunks.length} chunks into Supabase.`);
}

main().catch(console.error);
