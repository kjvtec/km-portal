-- ==============================================================================
-- AI Knowledge Management (KM Portal) Database Schema for Supabase
-- Target: PostgreSQL with pgvector extension
-- ==============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Workspaces table (Projects / Knowledge Spaces)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Documents table (Document Metadata and Full Content)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'markdown', -- 'markdown', 'pdf', 'docx', 'text'
    file_path TEXT,                             -- Optional Supabase Storage file path
    content TEXT,                               -- Raw text or Markdown content
    metadata JSONB DEFAULT '{}'::jsonb,         -- Tags, author, source doc info
    created_by UUID,                            -- References auth.users(id) if enabled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Document Chunks table (Chunked text with Vector Embeddings)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small (1536 dims)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON public.documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_workspace_id ON public.document_chunks(workspace_id);

-- Create HNSW Vector Index for Cosine Similarity Search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- 6. RPC Function: match_document_chunks (RAG Similarity Search)
CREATE OR REPLACE FUNCTION match_document_chunks (
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 5,
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
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        d.title,
        dc.chunk_index,
        dc.content,
        (1 - (dc.embedding <=> query_embedding))::FLOAT AS similarity
    FROM public.document_chunks dc
    JOIN public.documents d ON dc.document_id = d.id
    WHERE 
        (filter_workspace_id IS NULL OR dc.workspace_id = filter_workspace_id)
        AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 7. Insert Default Workspace for JFFPOS
INSERT INTO public.workspaces (name, slug, description)
VALUES (
    'JFFPOS Retail (PTTRM)', 
    'jffpos', 
    'ระบบ POS Vtec Retail & บริหารสินค้าคงคลังร้านสะดวกซื้อ Jiffy (DSD BA06)'
)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Allow public read for workspaces & documents (can be restricted to authenticated users)
CREATE POLICY "Public read workspaces" ON public.workspaces FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Public read chunks" ON public.document_chunks FOR SELECT USING (true);

-- Allow service role full access for backend ingest and administration
CREATE POLICY "Service role full access workspaces" ON public.workspaces USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access documents" ON public.documents USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access chunks" ON public.document_chunks USING (auth.role() = 'service_role');
