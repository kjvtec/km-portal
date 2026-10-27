import OpenAI from "openai";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }
  return new OpenAI({ apiKey });
}

/**
 * Generates vector embedding for a single text using text-embedding-3-small (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const cleanText = text.replace(/\n+/g, " ").trim();

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: cleanText,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

/**
 * Generates vector embeddings for an array of texts in batches
 */
export async function generateBatchEmbeddings(
  texts: string[],
  batchSize: number = 30
): Promise<number[][]> {
  const openai = getOpenAIClient();
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map((t) => t.replace(/\n+/g, " ").trim());
    if (batch.length === 0) continue;

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
      dimensions: 1536,
    });

    for (const item of response.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}
