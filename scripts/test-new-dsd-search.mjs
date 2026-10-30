import { supabase } from "./supabase-client.mjs";

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
