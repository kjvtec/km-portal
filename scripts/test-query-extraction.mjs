import { supabase } from "./supabase-client.mjs";

// Extract keywords from query
function extractKeywords(query) {
  // Extract English words / codes (2+ chars)
  const englishMatches = query.match(/[A-Za-z0-9_\-\.]{2,}/g) || [];

  // Extract Thai words separated by space or common boundaries
  const words = query
    .replace(/[?.,!/\\()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  const keywords = Array.from(new Set([...englishMatches, ...words]));
  return keywords;
}

async function search(query) {
  console.log(`\n=== Testing Query: "${query}" ===`);
  const keywords = extractKeywords(query);
  console.log("Extracted keywords:", keywords);

  const resultsMap = new Map();

  // 1. Search full query
  const { data: fullMatches } = await supabase.rpc("search_document_chunks_text", {
    query_text: query,
    match_count: 5,
  });

  (fullMatches || []).forEach((item) => resultsMap.set(item.id, item));

  // 2. Search each keyword
  for (const kw of keywords) {
    const { data: kwMatches } = await supabase.rpc("search_document_chunks_text", {
      query_text: kw,
      match_count: 3,
    });
    (kwMatches || []).forEach((item) => {
      if (!resultsMap.has(item.id)) {
        resultsMap.set(item.id, item);
      }
    });
  }

  const list = Array.from(resultsMap.values()).slice(0, 5);
  console.log(`Found ${list.length} relevant chunks:`);
  list.forEach((c, idx) => {
    console.log(`[${idx + 1}] Chunk ${c.chunk_index} (sim: ${c.similarity}):`);
    console.log(c.content.slice(0, 180) + "...\n");
  });
}

async function main() {
  await search("WAC คำนวณตอนไหนบ้าง");
  await search("Tolerance ในการรับสินค้ากำหนดไว้อย่างไร");
  await search("BR-06-01-01 คืออะไร");
}

main().catch(console.error);
