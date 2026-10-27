import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cnzthrnkyumhgsomszwu.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuenRocm5reXVtaGdzb21zend1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjExODAyNCwiZXhwIjoyMTA3Njk0MDI0fQ.nXRVNOCjmlQGQe_xYGPX2TB0ezyrT4nIwIT64iYlPDQ";

const supabase = createClient(supabaseUrl, serviceKey);

async function purgeOldDoc() {
  const oldDocId = "20373660-ec49-49ad-bf22-45f32ef36b00";
  console.log("Deleting chunks of old doc:", oldDocId);
  const { error: chunkErr } = await supabase.from("document_chunks").delete().eq("document_id", oldDocId);
  if (chunkErr) console.error("Error deleting chunks:", chunkErr);

  console.log("Deleting document record:", oldDocId);
  const { error: docErr } = await supabase.from("documents").delete().eq("id", oldDocId);
  if (docErr) console.error("Error deleting doc:", docErr);

  const { data: docs } = await supabase.from("documents").select("id, title");
  console.log("Remaining Documents:", docs);

  const { count } = await supabase.from("document_chunks").select("*", { count: "exact", head: true });
  console.log("Remaining Chunks count:", count);
}

purgeOldDoc().catch(console.error);
