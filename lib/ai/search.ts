import { requireServiceSupabase } from "@/lib/supabase/admin";
import { generateEmbedding } from "./embedding";

export interface MatchedChunk {
  id: string;
  document_id: string;
  title: string;
  chunk_index: number;
  content: string;
  similarity: number;
}

// In-memory query cache with TTL (10 minutes)
interface CacheEntry {
  timestamp: number;
  data: MatchedChunk[];
}
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_SIZE = 200;

function getCachedResults(cacheKey: string): MatchedChunk[] | null {
  const entry = searchCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    searchCache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

function setCachedResults(cacheKey: string, data: MatchedChunk[]) {
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  searchCache.set(cacheKey, { timestamp: Date.now(), data });
}

function extractKeywords(query: string): string[] {
  // Extract English words / acronyms / codes (2+ chars)
  const englishMatches = query.match(/[A-Za-z0-9_\-\.]{2,}/g) || [];

  // Extract Thai words separated by space or common punctuation
  const words = query
    .replace(/[?.,!/\\():;]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2);

  return Array.from(new Set([...englishMatches, ...words]));
}

/**
 * Searches for document chunks matching the query text.
 * Uses vector similarity if OPENAI_API_KEY is available; otherwise falls back to
 * optimized PostgreSQL keyword & full-text search with parallel execution & caching.
 */
export async function searchSimilarChunks(
  query: string,
  options: {
    workspaceId?: string;
    threshold?: number;
    limit?: number;
  } = {}
): Promise<MatchedChunk[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const limit = options.limit ?? 6;
  const threshold = options.threshold ?? 0.25;
  const cacheKey = `${options.workspaceId || "global"}:${limit}:${threshold}:${cleanQuery.toLowerCase()}`;

  // Check in-memory cache first (0ms latency hit)
  const cached = getCachedResults(cacheKey);
  if (cached) {
    return cached;
  }

  const supabase = requireServiceSupabase();

  // 1. Try Vector Search if OPENAI_API_KEY is configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const queryEmbedding = await generateEmbedding(cleanQuery);
      const { data, error } = await supabase.rpc("match_document_chunks", {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_workspace_id: options.workspaceId || null,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        const results = data as MatchedChunk[];
        setCachedResults(cacheKey, results);
        return results;
      }
    } catch (err) {
      console.warn("Vector search failed or not configured, falling back to text search:", err);
    }
  }

  // 2. Optimized Text & Keyword Search
  const resultsMap = new Map<string, MatchedChunk>();
  const keywords = extractKeywords(cleanQuery).slice(0, 4); // Limit to top 4 keywords to avoid flooding

  // Perform full query text search first
  try {
    const { data: fullMatches, error: fullErr } = await supabase.rpc(
      "search_document_chunks_text",
      {
        query_text: cleanQuery,
        match_count: limit,
        filter_workspace_id: options.workspaceId || null,
      }
    );

    if (!fullErr && Array.isArray(fullMatches)) {
      for (const item of fullMatches) {
        resultsMap.set(item.id, item as MatchedChunk);
      }
    }
  } catch (err) {
    console.warn("Full text search query error:", err);
  }

  // If full matches already hit limit, we can return immediately (saves ~1-2 seconds)
  if (resultsMap.size < limit && keywords.length > 0) {
    // Execute keyword searches in PARALLEL instead of sequentially
    const keywordPromises = keywords
      .filter((kw) => kw.toLowerCase() !== cleanQuery.toLowerCase())
      .map(async (kw) => {
        try {
          const { data: kwMatches } = await supabase.rpc("search_document_chunks_text", {
            query_text: kw,
            match_count: Math.min(limit, 4),
            filter_workspace_id: options.workspaceId || null,
          });
          return Array.isArray(kwMatches) ? (kwMatches as MatchedChunk[]) : [];
        } catch {
          return [];
        }
      });

    const keywordResults = await Promise.all(keywordPromises);
    for (const batch of keywordResults) {
      for (const item of batch) {
        if (!resultsMap.has(item.id)) {
          resultsMap.set(item.id, item);
        }
      }
    }
  }

  const finalResults = Array.from(resultsMap.values()).slice(0, limit);
  setCachedResults(cacheKey, finalResults);
  return finalResults;
}
