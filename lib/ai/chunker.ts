export interface TextChunk {
  chunkIndex: number;
  content: string;
  tokenCount: number;
}

interface ChunkOptions {
  maxChunkSize?: number; // Approximate max characters per chunk (default ~1000)
  overlapSize?: number;  // Characters of overlap between chunks (default ~150)
}

/**
 * Splits markdown/text content into semantically coherent chunks with overlap.
 * Preserves headings and paragraph boundaries where possible.
 */
export function chunkText(
  text: string,
  options: ChunkOptions = {}
): TextChunk[] {
  const maxChunkSize = options.maxChunkSize || 1000;
  const overlapSize = options.overlapSize || 150;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split by markdown structural boundaries: headers or double newlines
  const sections = text.split(/(?=\n#{1,4}\s)|(?:\n\s*\n)/g);
  const chunks: TextChunk[] = [];

  let currentChunk = "";
  let chunkIndex = 0;

  for (const section of sections) {
    const cleanSection = section.trim();
    if (!cleanSection) continue;

    // If adding section exceeds maxChunkSize and currentChunk is not empty, push currentChunk
    if (currentChunk.length + cleanSection.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        chunkIndex,
        content: currentChunk.trim(),
        tokenCount: Math.ceil(currentChunk.length / 4),
      });
      chunkIndex++;

      // Create overlap from the end of currentChunk
      const overlapText = currentChunk.slice(-overlapSize);
      currentChunk = overlapText + "\n\n" + cleanSection;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + cleanSection : cleanSection;
    }

    // If a single section is larger than maxChunkSize, slice it recursively
    while (currentChunk.length > maxChunkSize * 1.5) {
      const slicePoint = currentChunk.lastIndexOf("\n", maxChunkSize) > 0
        ? currentChunk.lastIndexOf("\n", maxChunkSize)
        : maxChunkSize;

      const chunkContent = currentChunk.slice(0, slicePoint).trim();
      chunks.push({
        chunkIndex,
        content: chunkContent,
        tokenCount: Math.ceil(chunkContent.length / 4),
      });
      chunkIndex++;

      const remaining = currentChunk.slice(slicePoint).trim();
      currentChunk = remaining;
    }
  }

  // Push final remaining chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      chunkIndex,
      content: currentChunk.trim(),
      tokenCount: Math.ceil(currentChunk.length / 4),
    });
  }

  return chunks;
}
