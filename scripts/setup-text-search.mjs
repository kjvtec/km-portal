import path from "path";
import { fileURLToPath } from "url";

try {
  process.loadEnvFile?.(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local"));
} catch {}

const pat = process.env.SUPABASE_ACCESS_TOKEN || "YOUR_SUPABASE_PAT_HERE";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "YOUR_PROJECT_REF";

const sql = `
DROP FUNCTION IF EXISTS search_document_chunks_text(TEXT, INT, UUID);
DROP FUNCTION IF EXISTS search_document_chunks_text;

CREATE OR REPLACE FUNCTION search_document_chunks_text (
    query_text TEXT,
    match_count INT DEFAULT 6,
    filter_workspace_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    title TEXT,
    chunk_index INT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
    clean_query TEXT := trim(query_text);
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        d.title,
        dc.chunk_index,
        dc.content,
        (
            CASE 
                WHEN dc.content ILIKE '%' || clean_query || '%' THEN 0.95
                WHEN d.title ILIKE '%' || clean_query || '%' THEN 0.85
                ELSE 0.60
            END
        )::FLOAT AS similarity
    FROM public.document_chunks dc
    JOIN public.documents d ON dc.document_id = d.id
    WHERE 
        (filter_workspace_id IS NULL OR dc.workspace_id = filter_workspace_id)
        AND (
            dc.content ILIKE '%' || clean_query || '%'
            OR d.title ILIKE '%' || clean_query || '%'
            OR to_tsvector('simple', dc.content) @@ plainto_tsquery('simple', clean_query)
        )
    ORDER BY 
        CASE WHEN dc.content ILIKE '%' || clean_query || '%' THEN 1 ELSE 0 END DESC,
        dc.chunk_index ASC
    LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION search_document_chunks_text TO postgres, anon, authenticated, service_role;
`;

async function run() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.json();
  console.log("Status:", res.status);
  console.log("Result:", JSON.stringify(body, null, 2));
}

run().catch(console.error);
