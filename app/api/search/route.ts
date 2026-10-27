import { NextRequest, NextResponse } from "next/server";
import { searchSimilarChunks } from "@/lib/ai/search";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const workspaceId = searchParams.get("workspaceId") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 5;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = await searchSimilarChunks(query, {
      workspaceId,
      limit,
    });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("Search API error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
