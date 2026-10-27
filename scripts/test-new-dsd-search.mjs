import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cnzthrnkyumhgsomszwu.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuenRocm5reXVtaGdzb21zend1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjExODAyNCwiZXhwIjoyMTA3Njk0MDI0fQ.nXRVNOCjmlQGQe_xYGPX2TB0ezyrT4nIwIT64iYlPDQ";

const supabase = createClient(supabaseUrl, serviceKey);

async function test(query) {
  console.log(`\n=== Testing query: "${query}" ===`);
  const { data, error } = await supabase.rpc("search_document_chunks_text", {
    query_text: query,
    match_count: 3,
  });

  if (error) {
    console.error("RPC error:", error);
    return;
  }

  console.log(`Found ${data?.length || 0} matches:`);
  data?.forEach((item, i) => {
    console.log(`[${i + 1}] Similarity: ${item.similarity} | Chunk ${item.chunk_index}`);
    console.log(item.content.slice(0, 250) + "...\n");
  });
}

async function main() {
  await test("Blueplus");
  await test("วังน้อย");
  await test("BA-01 โครงสร้างข้อมูลหลัก");
  await test("WAC");
  await test("Tolerance");
}

main().catch(console.error);
