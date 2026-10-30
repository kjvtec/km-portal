import { supabase } from "./supabase-client.mjs";

async function check() {
  const { data: docs } = await supabase
    .from("documents")
    .select("id, title, created_at, updated_at");
  console.log("Documents currently in Supabase:", docs);

  const { count } = await supabase
    .from("document_chunks")
    .select("*", { count: "exact", head: true });
  console.log("Total chunks count:", count);
}

check().catch(console.error);
