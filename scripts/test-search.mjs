import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cnzthrnkyumhgsomszwu.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuenRocm5reXVtaGdzb21zend1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjExODAyNCwiZXhwIjoyMTA3Njk0MDI0fQ.nXRVNOCjmlQGQe_xYGPX2TB0ezyrT4nIwIT64iYlPDQ";

const supabase = createClient(supabaseUrl, serviceKey);

async function testSearch(term) {
  console.log(`\n--- Searching for: "${term}" ---`);
  const { data, error } = await supabase.rpc("search_document_chunks_text", {
    query_text: term,
    match_count: 2,
  });

  if (error) {
    console.error("Search error:", error);
    return;
  }

  console.log(`Found ${data?.length || 0} results:`);
  data?.forEach((item, i) => {
    console.log(`[${i + 1}] Similarity: ${item.similarity} | Chunk ${item.chunk_index}`);
    console.log(item.content.slice(0, 180) + "...\n");
  });
}

async function main() {
  await testSearch("OpenVPN");
  await testSearch("vtechq-eks-dev");
  await testSearch("Aurora PostgreSQL");
  await testSearch("ras-dev.pttrm.com");
}

main().catch(console.error);
